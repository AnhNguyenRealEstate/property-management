import { Injectable } from '@angular/core';
import { Firestore, collection, limit, getDocs, query, orderBy } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Owner } from '../property-management.data';

@Injectable({ providedIn: 'root' })
export class OwnersViewService {
    private quotaPerQuery = 10;

    constructor(
        private firestore: Firestore
    ) { }


    async getOwners(): Promise<Owner[]> {

        const snapshot = await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.owners),
                limit(this.quotaPerQuery),
                orderBy('contactName')
            )
        );

        const owners = snapshot.docs.map(doc => doc.data() as Owner);
        return owners;
    }

    async getOwnersTypesense(queryString?: string): Promise<Owner[]> {
        if (!queryString) {
            return this.getOwners();
        }

        return [];
    }

}