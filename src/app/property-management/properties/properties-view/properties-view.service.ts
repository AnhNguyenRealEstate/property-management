import { Injectable } from '@angular/core';
import { Firestore, collection, limit, where, getDocs, query, orderBy } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property, PropertyCategory } from "../property.data";

@Injectable({ providedIn: 'root' })
export class PropertiesViewService {
    private gettingProperties$$ = new BehaviorSubject<boolean>(false);
    gettingProperties$ = this.gettingProperties$$.asObservable();

    constructor(
        private firestore: Firestore
    ) { }


    async getProperties(category?: PropertyCategory): Promise<Property[]> {
        this.gettingProperties$$.next(true);

        let q = query(
            collection(this.firestore, FirestoreCollections.underManagement),
            orderBy('creationDate', 'desc')
        );

        if (category) {
            q = query(q, where('category', '==', category));
        }

        const result = await getDocs(q);

        this.gettingProperties$$.next(false);

        return result.docs.map(doc => {
            return doc.data() as Property;
        });

    }

}