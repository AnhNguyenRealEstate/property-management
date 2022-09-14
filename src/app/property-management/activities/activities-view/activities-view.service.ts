import { Injectable } from '@angular/core';
import { collectionGroup, Firestore, getDocs, limit, orderBy, query, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';

@Injectable({ providedIn: 'root' })
export class ActivitiesViewService {
    private gettingActivities$$ = new BehaviorSubject<boolean>(false);
    gettingActivities$ = this.gettingActivities$$.asObservable();

    private limit: number = 15;

    constructor(
        private firestore: Firestore,
    ) { }

    async getActivities(owner?: string) {
        this.gettingActivities$$.next(true);

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.activities),
            orderBy('date', 'desc'),
            limit(this.limit)
        );

        if (owner) {
            q = query(q, where('owner', '==', owner));
        }
        
        const snapshot = await getDocs(q);
        this.gettingActivities$$.next(false);

        return snapshot;
    }
}