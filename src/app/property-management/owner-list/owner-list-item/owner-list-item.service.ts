import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDocs, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Owner, Property } from '../../property-management.data';

@Injectable({ providedIn: 'any' })
export class OwnerListItemService {
    constructor(
        private firestore: Firestore
    ) {
    }

    async getPropertiesFrom(ownerUsername: string): Promise<Property[]> {
        const snapshot = await getDocs(query(
            collection(this.firestore, FirestoreCollections.underManagement),
            where('ownerUsername', '==', ownerUsername),
            orderBy('creationDate', 'desc')
        ));

        const properties = snapshot.docs.map(doc => doc.data() as Property);
        return properties;
    }

    async deleteOwner(owner: Owner) {
        await deleteDoc(
            doc(this.firestore, `${FirestoreCollections.owners}/${owner.id}`)
        );
    }

}