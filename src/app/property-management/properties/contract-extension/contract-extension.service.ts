import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, LOCALE_ID } from '@angular/core'
import { addDoc, collection, doc, Firestore, Timestamp, updateDoc } from '@angular/fire/firestore'
import { ref, Storage, uploadBytes } from '@angular/fire/storage'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { FirestoreCollections } from 'src/app/shared/globals'
import { environment } from 'src/environments/environment'
import { Activity } from '../../activities/activity.data'
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data'
import { ContractData } from '../property-upload/property-upload.data'
import { Property } from '../property.data'
import { ExtensionData } from './contract-extension.data'
import { formatDate } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ContractExtensionService {
    private endpoint = environment.contractExtractorEndpoint

    private extracting$$ = new BehaviorSubject<boolean>(false)
    extracting$ = this.extracting$$.asObservable()

    private uploading$$ = new BehaviorSubject<boolean>(false)
    uploading$ = this.uploading$$.asObservable()

    constructor(
        private httpClient: HttpClient,
        private firestore: Firestore,
        private storage: Storage,
        @Inject(LOCALE_ID) private locale: string
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
     * Upload extension data into 'rental-extension' collection
     * Cloud Functions scans it every day, automatically extends the contract when the time comes
     * 
     * Upload the files
     * Add the payment schedule
     * Create a new activity to note that there was an extension
     * Update the list of documents under the property
     */
    async extendContract(property: Property, extensionData: ExtensionData, newFiles: File[], schedules: PaymentSchedule[]) {
        await this.storeFiles(newFiles, property)
        await this.uploadSchedules(schedules, property)

        await addDoc(
            collection(
                this.firestore,
                `${FirestoreCollections.underManagement}/${property.id}/${FirestoreCollections.activities}`
            ),
            {
                date: Timestamp.fromDate(new Date()),
                description: `Gia hạn, bắt đầu từ ${formatDate(extensionData.startDate!.toDate(), 'dd/MM/yyyy', this.locale)
                    }`,
                propertyId: property.id,
                propertyName: property.name
            } as Activity
        )

        await addDoc(collection(this.firestore, `${FirestoreCollections.rentalExtension}`), extensionData)

        await updateDoc(
            doc(
                this.firestore, `${FirestoreCollections.underManagement}/${property.id}`
            ),
            { ...property }
        )
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

    async uploadSchedules(schedules: PaymentSchedule[], property: Property): Promise<string[]> {
        const scheduleIds = await Promise.all(schedules.map(async schedule => {

            const scheduleRef = await addDoc(collection(this.firestore, FirestoreCollections.paymentSchedules), {
                isActive: schedule.isActive,
                beginDate: schedule.beginDate,
                endDate: schedule.endDate
            });

            const invoices = schedule.lineItems

            if (!invoices?.length) {
                return ''
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

            return scheduleRef.id
        }));

        scheduleIds.filter(id => !!id)
        property.paymentScheduleIds?.push(...scheduleIds)

        const docRef = doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`)
        await updateDoc(docRef, { paymentScheduleIds: property.paymentScheduleIds })

        return property.paymentScheduleIds || []
    }
}
