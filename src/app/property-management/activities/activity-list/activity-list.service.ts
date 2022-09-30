import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from '../../properties/property-card/property-card.data';

@Injectable({ providedIn: 'root' })
export class ActivityListService {
    constructor(
        private firestore: Firestore
    ) { }

    async getProperty(id: string): Promise<Property> {
        const snapshot = await getDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${id}`));
        return snapshot.data() as Property;
    }
}