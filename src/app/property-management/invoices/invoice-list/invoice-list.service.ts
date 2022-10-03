import { Injectable } from '@angular/core';
import { collection, collectionGroup, doc, Firestore, getDoc, query, updateDoc } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from '../../properties/property.data';
import { Invoice } from '../invoices.data';

@Injectable({ providedIn: 'root' })
export class InvoiceListService {
    constructor(
        private firestore: Firestore
    ) { }

    async updateInvoice(invoice: Invoice) {
        await updateDoc(
            doc(
                this.firestore,
                `${FirestoreCollections.paymentSchedules}/${invoice.scheduleId}/${FirestoreCollections.invoices}/${invoice.id}`
            ),
            { ...invoice }
        )
    }

    async getProperty(id: string): Promise<Property> {
        const snapshot = await getDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${id}`));
        return snapshot.data() as Property;
    }
}