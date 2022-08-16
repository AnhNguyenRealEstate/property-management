import { Injectable } from '@angular/core';
import { Firestore, collection, limit, where, getDocs, query, orderBy } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from "../property-card/property.data";

@Injectable({ providedIn: 'root' })
export class PropertiesViewService {
    private quotaPerQuery = 6;

    private gettingProperties$$ = new BehaviorSubject<boolean>(false);
    gettingProperties$ = this.gettingProperties$$.asObservable();

    constructor(
        private firestore: Firestore
    ) { }


    async getProperties(owner?: string): Promise<Property[]> {
        this.gettingProperties$$.next(true);

        let q = query(
            collection(this.firestore, FirestoreCollections.underManagement), 
            limit(this.quotaPerQuery),
            orderBy('creationDate', 'desc'));

        if (owner) {
            q = query(q, (where("ownerUsername", "==", owner)));
        }

        const result = await getDocs(q);

        this.gettingProperties$$.next(false);

        return result.docs.map(doc => {
            return doc.data() as Property;
        });
        
    }

}