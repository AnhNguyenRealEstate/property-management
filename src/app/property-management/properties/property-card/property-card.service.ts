import { Injectable } from '@angular/core';
import { deleteDoc, addDoc, doc, Firestore, getDocs, collection, limit, query, DocumentData, QuerySnapshot, startAfter, DocumentSnapshot, orderBy, collectionGroup } from '@angular/fire/firestore';
import { deleteObject, listAll, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
import { Property } from "../property.data";

@Injectable({ providedIn: 'any' })
export class PropertyCardService {
    constructor(
        private firestore: Firestore
    ) { }

    /**
     * Remove the property and all files/activities related to it
     * @param property The property to remove
     * @returns 
     */
    async deleteProperty(property: Property) {
        if (!property.id) {
            return;
        }

        deleteDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`));
    }

    async getMostRecentActivity(property: Property) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    'activities'
                ),
                orderBy('date', 'desc'),
                limit(1)
            )
        );

        if (snapshot.docs.length) {
            return snapshot.docs[0]?.data() as Activity;
        } else {
            return undefined;
        }
    }
}