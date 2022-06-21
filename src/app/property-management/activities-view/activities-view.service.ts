import { Injectable } from '@angular/core';
import { collectionGroup, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';

@Injectable({ providedIn: 'root' })
export class ActivitiesViewService {
    constructor(
        private firestore: Firestore,
    ) { }

    async getActivities(owner?: string) {
        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.activities),
            orderBy('date', 'desc')
        );

        if (owner) {
            q = query(q, where('owner', '==', owner));
        }

        return await getDocs(q);
    }
}