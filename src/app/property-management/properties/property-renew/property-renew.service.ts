import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, updateDoc, Timestamp, doc } from '@angular/fire/firestore';
import { uploadBytes, ref, Storage } from '@angular/fire/storage';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { environment } from 'src/environments/environment';
import { Activity } from '../../activities/activity.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { ContractData } from '../property-upload/property-upload.data';
import { Property } from '../property.data';

@Injectable({ providedIn: 'root' })
export class PropertyRenewService {
    private endpoint = environment.contractExtractorEndpoint;

    private extracting$$ = new BehaviorSubject<boolean>(false);
    extracting$ = this.extracting$$.asObservable();

    private uploading$$ = new BehaviorSubject<boolean>(false);
    uploading$ = this.uploading$$.asObservable();

    constructor(
        private httpClient: HttpClient,
        private firestore: Firestore,
        private storage: Storage,
        private userProfile: UserProfileService
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

    /**
     * Renew a property with new rental contract
     * @param property The property to be renewed
     * @param files New files to be uploaded along with the renewal
     * @param uploadedFiles Mapping between display names and db names of the new files
     * @param schedules New payment schedules
     * @returns The property's id
     */
    async renewProperty(property: Property, files: File[], uploadedFiles: UploadedFile[], schedules: PaymentSchedule[]): Promise<string> {
        await this.storeFiles(files, uploadedFiles, property);
        if (!property.documents?.length) {
            property.documents = []
        }
        property.documents.unshift(...uploadedFiles);

        const scheduleRefIds: string[] = await this.uploadSchedules(schedules, property.id!);
        if (!property.paymentScheduleIds?.length) {
            property.paymentScheduleIds = []
        }
        property.paymentScheduleIds.push(...scheduleRefIds);

        await updateDoc(
            doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
            { ...property }
        );

        await addDoc(
            collection(this.firestore, `${FirestoreCollections.underManagement}/${property.id}/${FirestoreCollections.activities}`),
            {
                date: Timestamp.now(),
                description: `Hợp đồng thuê mới. Bên thuê: ${property.tenantName}`,
                propertyId: property.id,
                propertyName: property.name,
                type: 'newContract',
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )

        return property.id!;
    }

    private async storeFiles(files: File[], uploadedFiles: UploadedFile[], property: Property) {
        if (!files.length) return;

        await Promise.all(files.map(async (file) => {
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
}