import { Injectable } from '@angular/core';
import { addDoc, collection, collectionGroup, doc, Firestore, getDoc, query, Timestamp, updateDoc } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { UserProfileService } from 'src/app/shared/user-profile.service';
import { Activity } from '../../activities/activity.data';
import { Property } from '../../properties/property.data';
import { Invoice } from '../invoices.data';

@Injectable({ providedIn: 'root' })
export class InvoiceListService {
    constructor(
        private firestore: Firestore,
        private userProfile: UserProfileService
    ) { }

    async updateInvoice(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            { ...invoice }
        )

        await addDoc(
            collection(
                this.firestore,
                `${FirestoreCollections.underManagement}/${invoice.propertyId}/${FirestoreCollections.activities}`
            ),
            {
                date: Timestamp.fromDate(new Date()),
                description: `Cập nhật thông tin biên nhận`,
                propertyId: invoice.propertyId,
                propertyName: invoice.propertyName,
                type: 'invoice',
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )
    }

    async markInvoiceAsPaid(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            {
                ...invoice
            }
        );

        await addDoc(
            collection(
                this.firestore,
                `${FirestoreCollections.underManagement}/${invoice.propertyId}/${FirestoreCollections.activities}`
            ),
            {
                date: Timestamp.fromDate(new Date()),
                description: `Đã thu ${invoice.amount} từ ${invoice.payer} cho giai đoạn ${invoice.paymentWindow}`,
                propertyId: invoice.propertyId,
                propertyName: invoice.propertyName,
                type: 'invoice',
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )
    }

    async markInvoiceAsPaidOut(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            {
                ...invoice
            }
        );

        await addDoc(
            collection(
                this.firestore,
                `${FirestoreCollections.underManagement}/${invoice.propertyId}/${FirestoreCollections.activities}`
            ),
            {
                date: Timestamp.fromDate(new Date()),
                description: `Gửi chủ nhà tiền thuê cho giai đoạn ${invoice.paymentWindow}`,
                propertyId: invoice.propertyId,
                propertyName: invoice.propertyName,
                type: 'invoice',
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )
    }

    async getProperty(id: string): Promise<Property> {
        const snapshot = await getDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${id}`));
        return snapshot.data() as Property;
    }
}