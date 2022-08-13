import { Injectable } from '@angular/core';
import { Firestore, collection, limit, getDocs, query, orderBy } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Owner } from '../property-management.data';

@Injectable({ providedIn: 'root' })
export class OwnersViewService {
    private gettingOwners$$ = new BehaviorSubject<boolean>(false);
    gettingOwners$ = this.gettingOwners$$.asObservable();

    private quotaPerQuery = 10;

    constructor(
        private firestore: Firestore
    ) { }


    async getOwners(): Promise<Owner[]> {
        this.gettingOwners$$.next(true);

        const snapshot = await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.owners),
                limit(this.quotaPerQuery),
                orderBy('contactName')
            )
        );

        const owners = snapshot.docs.map(doc => doc.data() as Owner);
        this.gettingOwners$$.next(false);

        return owners;
    }

    async getOwnersTypesense(queryString?: string): Promise<Owner[]> {
        if (!queryString) {
            return this.getOwners();
        }

        return [];
    }

    async deleteOwners(ownerUsername: string) {
        //TODO:
    }
}