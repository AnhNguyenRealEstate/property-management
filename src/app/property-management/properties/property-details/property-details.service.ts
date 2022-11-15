import { Injectable } from '@angular/core';
import { doc, Firestore, collection, DocumentSnapshot, getDocs, limit, query, startAfter, orderBy, getDoc, updateDoc, addDoc, Timestamp, docData, deleteDoc } from '@angular/fire/firestore';
import { deleteObject, getBlob, getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { lastValueFrom } from 'rxjs';
import { LoginService } from 'src/app/login/login.service';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
import { Invoice } from '../../invoices/invoices.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from "../property.data";

@Injectable({ providedIn: 'root' })
export class PropertyDetailsService {
    public initialNumOfActivities = 10;

    constructor(
        private firestore: Firestore,
        private storage: Storage,
        private login: LoginService
    ) { }

    async getDocUrl(docPath: string) {
        const loggedIn = lastValueFrom(this.login.loggedIn$);
        if (!loggedIn) {
            return '';
        }

        return await getDownloadURL(
            ref(this.storage, `${docPath}`)
        );
    }

    async downloadDoc(docPath: string): Promise<Blob> {
        const loggedIn = lastValueFrom(this.login.loggedIn$);
        if (!loggedIn) {
            return new Blob();
        }

        return await getBlob(ref(this.storage, `${docPath}`));
    }

    async deleteDoc(property: Property, docToDelete: UploadedFile, updatedListOfDocuments: UploadedFile[]) {
        const loggedIn = lastValueFrom(this.login.loggedIn$);
        if (!loggedIn) {
            return;
        }

        await deleteObject(
            ref(this.storage, `${property.fileStoragePath}/${docToDelete.dbHashedName}`)
        );

        await updateDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`), {
            documents: updatedListOfDocuments
        });
    }

    async getActivities(property: Property) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    FirestoreCollections.activities
                ),
                orderBy('date', 'desc'),
                limit(this.initialNumOfActivities)
            )
        );
        return snapshot;
    }

    async getMoreActivities(property: Property, lastResult: DocumentSnapshot) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    FirestoreCollections.activities
                ),
                orderBy('date', 'desc'),
                startAfter(lastResult),
                limit(this.initialNumOfActivities)
            )
        );

        return snapshot;
    }

    async getPaymentSchedules(scheduleIds: string[]): Promise<PaymentSchedule[]> {
        const schedules = await Promise.all(scheduleIds.map(async scheduleId => {
            const scheduleDocRef = doc(this.firestore, `${FirestoreCollections.paymentSchedules}/${scheduleId}`);
            const scheduleSnap = await getDoc(scheduleDocRef);
            const schedule = scheduleSnap.data() as PaymentSchedule;

            if (!schedule.isActive) {
                return {};
            }

            const invoicesSnap = await getDocs(
                query(
                    collection(this.firestore,
                        `${FirestoreCollections.paymentSchedules}/${scheduleSnap.id}/${FirestoreCollections.invoices}`
                    ),
                    orderBy('beginDate', 'asc')
                )
            );

            const lineItems = invoicesSnap.docs.map(doc => doc.data() as Invoice);
            schedule.lineItems = lineItems;

            return schedule;
        }));

        return schedules.filter(schedule => schedule.id);
    }

    async updatePaymentSchedule(schedule: PaymentSchedule) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${schedule.id}`
            ),
            { ...schedule }
        )
    }

    async updateInvoice(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            { ...invoice }
        )
    }

    async addActivity(property: Property, activity: Activity, newFiles: File[]) {
        try {
            // Only under extreme usage that there could be hash collision on file names
            // Highly unlikely to happen
            await Promise.all(newFiles.map(async file => {
                const hashedName = activity.documents!.find(document => document.displayName === file.name)?.dbHashedName;
                if (!hashedName) {
                    return;
                }

                const fileStoragePath = `${property.fileStoragePath}/${hashedName}`;
                await uploadBytes(
                    ref(
                        this.storage,
                        fileStoragePath
                    ),
                    file
                )
            }));
        } finally {
            const activitiyRef = await addDoc(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    FirestoreCollections.activities
                ),
                activity
            );

            activity.id = activitiyRef.id;
        }
    }

    async uploadSchedules(schedules: PaymentSchedule[], property: Property): Promise<string[]> {
        const scheduleIds = await Promise.all(schedules.map(async schedule => {

            const scheduleRef = await addDoc(collection(this.firestore, FirestoreCollections.paymentSchedules), {
                isActive: schedule.isActive,
                beginDate: schedule.beginDate,
                endDate: schedule.endDate,
                description: schedule.description
            });

            const invoices = schedule.lineItems;

            if (!invoices?.length) {
                return '';
            }

            await Promise.all(invoices.map(async (invoice) => {
                await addDoc(
                    collection(
                        doc(this.firestore, `${FirestoreCollections.paymentSchedules}/${scheduleRef.id}`),
                        FirestoreCollections.invoices
                    ),
                    { ...invoice, propertyId: property.id }
                );
            }));

            return scheduleRef.id;
        }));

        scheduleIds.filter(id => !!id);
        property.paymentScheduleIds?.push(...scheduleIds);

        const docRef = doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`);
        await updateDoc(docRef, { paymentScheduleIds: property.paymentScheduleIds });

        return property.paymentScheduleIds || [];
    }

    async storeFiles(files: File[], uploadedFiles: UploadedFile[], property: Property) {
        if (!files.length) return;

        const uploaded = await Promise.all(files.map(async (file) => {
            const docToUpload = uploadedFiles.find(document => document.displayName === file.name);
            const hashedName = docToUpload?.dbHashedName;
            if (!hashedName) {
                return;
            }

            const fileStoragePath = `${property.fileStoragePath}/${hashedName}`;
            await uploadBytes(
                ref(
                    this.storage,
                    fileStoragePath
                ),
                file
            );

            docToUpload.date = Timestamp.now();

            return docToUpload;
        }));

        if (!property.documents?.length) {
            property.documents = [];
        }

        property.documents.unshift(...uploaded.map(file => {
            return {
                displayName: file!.displayName,
                dbHashedName: file!.dbHashedName,
                date: Timestamp.now()
            } as UploadedFile
        }));

        const docRef = doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`);
        await updateDoc(docRef, {
            documents: property.documents
        });
    }

    async deactivateSchedule(schedule: PaymentSchedule) {
        await updateDoc(
            doc(this.firestore, `${FirestoreCollections.paymentSchedules}/${schedule.id}`),
            {
                isActive: false
            }
        )
    }

    async deleteInvoice(invoice: Invoice) {
        await deleteDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            )
        )
    }
}