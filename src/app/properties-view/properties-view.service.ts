import { Injectable } from '@angular/core';
import { Firestore, collection, limit, where, getDocs, query } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from '../property-management.data';

@Injectable({ providedIn: 'root' })
export class PropertiesViewService {
    private quotaPerQuery = 6;

    constructor(
        private firestore: Firestore
    ) { }


    async getProperties(owner?: string): Promise<Property[]> {
        let q = query(collection(this.firestore, FirestoreCollections.underManagement), limit(this.quotaPerQuery));

        if (owner) {
            q = query(q, (where("owner", "==", owner)));
        }

        const result = await getDocs(q);

        return result.docs.map(doc => {
            return doc.data() as Property;
        });
    }

}