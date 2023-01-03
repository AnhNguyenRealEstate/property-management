import { Injectable } from '@angular/core';
import { collection, collectionGroup, doc, Firestore, getDoc, getDocs, limit, orderBy, query, Timestamp, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
import { Invoice } from '../../invoices/invoices.data';
import { Property } from '../../properties/property.data';

@Injectable({ providedIn: 'root' })
export class SummaryViewService {
    private monthsTilExpiry = 6;
    private activityLimit = 8;

    constructor(
        private firestore: Firestore
    ) { }

    async getProperty(id: string): Promise<Property> {
        return (await getDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${id}`))).data() as Property;
    }

    async getSoonToExpireProps(): Promise<Property[]> {
        const today = new Date();
        const limit = new Date(today.getFullYear(), today.getMonth() + this.monthsTilExpiry, today.getDate());

        const snap = await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.underManagement),
                where('managementEndDate', '>=', today),
                where('managementEndDate', '<=', limit),
                orderBy('managementEndDate', 'desc')
            )
        );

        return snap.docs.map(doc => doc.data() as Property);
    }

    async getRecentActivities(): Promise<Activity[]> {
        const snap = await getDocs(
            query(
                collectionGroup(this.firestore, FirestoreCollections.activities),
                orderBy('date', 'desc'),
                limit(this.activityLimit)
            )
        );

        return snap.docs.map(doc => doc.data() as Activity);
    }

    async getInvoicesThisWeek(): Promise<Invoice[]> {

        // https://stackoverflow.com/a/4156516/11936773
        function getMonday(d: Date) {
            d = new Date(d)
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1) // adjust when day is sunday
            return new Date(d.setDate(diff))
        }

        const startOfWeek = getMonday(new Date())
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7)

        const snap = await getDocs(
            query(
                collectionGroup(this.firestore, FirestoreCollections.invoices),
                orderBy('beginDate', 'desc'),
                where('beginDate', '>=', Timestamp.fromDate(startOfWeek)),
                where('beginDate', '<=', Timestamp.fromDate(endOfWeek)),
                where('status', '==', 'unpaid')
            )
        )

        return snap.docs.map(doc => doc.data() as Invoice);
    }
}