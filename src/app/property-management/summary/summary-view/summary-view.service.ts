import { Injectable } from '@angular/core';
import { collection, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from '../../properties/property.data';

@Injectable({ providedIn: 'root' })
export class SummaryViewService {
    private monthsTilExpiry = 4;

    constructor(
        private firestore: Firestore
    ) { }

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
}