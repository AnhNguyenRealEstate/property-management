import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { getBlob, ref, Storage } from '@angular/fire/storage';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property } from '../../properties/property.data';
import { Activity } from '../activity.data';

@Injectable({ providedIn: 'root' })
export class ActivityListService {
    constructor(
        private firestore: Firestore,
        private storage: Storage
    ) { }

    async downloadDoc(docPath: string): Promise<Blob> {
        return await getBlob(ref(this.storage, `${docPath}`));
    }

    async removeActivity(activity: Activity) {
        const path = `${FirestoreCollections.underManagement}/${activity.propertyId}/${FirestoreCollections.activities}/${activity.id}`;
        await deleteDoc(doc(this.firestore, `${path}`));
    }

    async getProperty(id: string): Promise<Property> {
        return (await getDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${id}`))).data() as Property;
    }
}