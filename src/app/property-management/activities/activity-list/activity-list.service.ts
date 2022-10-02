import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { getBlob, ref, Storage } from '@angular/fire/storage';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../activities-view/activity.data';

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
}