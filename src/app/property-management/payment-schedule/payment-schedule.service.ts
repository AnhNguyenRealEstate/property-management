import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, Timestamp, updateDoc } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { Activity } from '../activities/activity.data';
import { Invoice } from '../invoices/invoices.data';

@Injectable({ providedIn: 'root' })
export class PaymentScheduleService {
    constructor(
        private firestore: Firestore,
        private userProfile: UserProfileService
    ) { }

    async markInvoiceAsPaid(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            {
                'status': 'paid',
                'paymentDate': Timestamp.fromDate(new Date())
            }
        );

        await addDoc(
            collection(
                this.firestore,
                `${FirestoreCollections.underManagement}/${invoice.propertyId}/${FirestoreCollections.activities}`
            ),
            {
                date: Timestamp.fromDate(new Date()),
                description: `Thanh toán tiền thuê cho giai đoạn ${invoice.paymentWindow}`,
                propertyId: invoice.propertyId,
                propertyName: invoice.propertyName,
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )
    }
}