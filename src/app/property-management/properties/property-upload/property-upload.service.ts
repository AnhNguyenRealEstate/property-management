import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, Timestamp, updateDoc } from '@angular/fire/firestore';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { environment } from 'src/environments/environment';
import { Activity } from '../../activities/activity.data';
import { Invoice } from '../../invoices/invoices.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { Property } from '../property.data';
import { ContractData } from './property-upload.data';

@Injectable({ providedIn: 'root' })
export class PropertyUploadService {
    private endpoint = environment.contractExtractorEndpoint;

    private extracting$$ = new BehaviorSubject<boolean>(false);
    extracting$ = this.extracting$$.asObservable();

    private uploading$$ = new BehaviorSubject<boolean>(false);
    uploading$ = this.uploading$$.asObservable();

    constructor(
        private httpClient: HttpClient,
        private firestore: Firestore,
        private storage: Storage
    ) { }

    async extractContractData(data: FormData): Promise<ContractData | undefined> {
        this.extracting$$.next(true);

        try {
            const dataIsValid = data.has('contract') && data.has('contract_type')
            if (!dataIsValid) {
                return;
            }

            return await firstValueFrom(this.httpClient.post(this.endpoint, data)) as ContractData
        } finally {
            this.extracting$$.next(false);
        }
    }

    async uploadProperty(property: Property, uploadedFiles: File[], schedules: PaymentSchedule[]): Promise<string> {
        function createFileStoragePath(property: Property) {
            const date = new Date();
            const folderName =
                `${property.name?.substring(0, 5)}-${property.category}-${date.getMonth()}${date.getDate()}-${Math.random() * 1000000}`;
            return `${FirebaseStorageConsts.underManagement}/${folderName}`;
        }

        property.fileStoragePath = createFileStoragePath(property);
        await this.storeFiles(uploadedFiles, property);

        const docRef = await addDoc(collection(this.firestore, FirestoreCollections.underManagement), property);
        const propertyId = docRef.id;

        const scheduleRefIds: string[] = await this.uploadSchedules(schedules, propertyId);
        await updateDoc(docRef, { paymentScheduleIds: scheduleRefIds });
        property.paymentScheduleIds = scheduleRefIds;

        property.id = propertyId;

        return propertyId;
    }

    private async storeFiles(files: File[], property: Property) {
        if (!files.length) return;

        await Promise.all(files.map(async (file) => {
            const docToUpload = property.documents!.find(document => document.displayName === file.name);
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
        }));
    }

    /**
     * Store invoices into a property's Invoices subcollection
     * @param invoices The invoices to be stored in the property's Invoices subcollection
     * @param propertyId The firebase ID of the property
     */
    private async uploadSchedules(schedules: PaymentSchedule[], propertyId: string): Promise<string[]> {

        const scheduleIds = await Promise.all(schedules.map(async schedule => {

            const scheduleRef = await addDoc(collection(this.firestore, FirestoreCollections.paymentSchedules), {
                isActive: schedule.isActive,
                beginDate: schedule.beginDate,
                endDate: schedule.endDate
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
                    { ...invoice, propertyId: propertyId }
                );
            }));

            return scheduleRef.id;
        }));

        return scheduleIds.filter(id => !!id);
    }

    async addActivity(property: Property, activity: Activity) {
        await addDoc(
            collection(this.firestore, `${FirestoreCollections.underManagement}/${property.id}/${FirestoreCollections.activities}`),
            activity
        )
    }
}
