import { Injectable } from '@angular/core';
import { collectionGroup, Firestore, getDocs, limit, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';

@Injectable({ providedIn: 'root' })
export class ActivitiesViewService {
    limit: number = 15;

    constructor(
        private firestore: Firestore,
    ) { }

    async getActivities(owner?: string) {

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.activities),
            orderBy('date', 'desc'),
            limit(this.limit)
        );

        if (owner) {
            q = query(q, where('owner', '==', owner));
        }

        return await getDocs(q);
    }
}