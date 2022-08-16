import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Owner } from "../../owners-view/owner.data";
import { Property } from "../../property-card/property.data";

@Injectable({ providedIn: 'root' })
export class OwnerListItemService {
    private gettingProperties$$ = new BehaviorSubject<boolean>(false);
    gettingProperties$ = this.gettingProperties$$.asObservable();

    constructor(
        private firestore: Firestore
    ) {
    }

    async getPropertiesFrom(ownerUsername: string): Promise<Property[]> {
        this.gettingProperties$$.next(true);

        const snapshot = await getDocs(query(
            collection(this.firestore, FirestoreCollections.underManagement),
            where('ownerUsername', '==', ownerUsername),
            orderBy('creationDate', 'desc')
        ));

        const properties = snapshot.docs.map(doc => doc.data() as Property);
        this.gettingProperties$$.next(false);

        return properties;
    }

    async deleteOwner(owner: Owner) {
        await deleteDoc(
            doc(this.firestore, `${FirestoreCollections.owners}/${owner.id}`)
        );
    }

}