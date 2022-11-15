import { Injectable } from '@angular/core';
import { collection, collectionGroup, doc, Firestore, getDoc, getDocs, limit, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
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
}