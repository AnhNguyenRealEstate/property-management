import { Injectable } from '@angular/core';
import { deleteDoc, addDoc, doc, Firestore, getDocs, collection, limit, query, DocumentData, QuerySnapshot, startAfter, DocumentSnapshot, orderBy, collectionGroup } from '@angular/fire/firestore';
import { deleteObject, listAll, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { Activity, Property } from '../property-management.data';

@Injectable({ providedIn: 'any' })
export class PropertyCardService {
    constructor(
        private firestore: Firestore,
        private storage: Storage
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

        const fileStoragePath = property.fileStoragePath!;
        listAll(ref(this.storage, fileStoragePath)).then(result => {
            const allFiles = result.items;
            allFiles.map(file => {
                deleteObject(ref(file));
            });
        });

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

    async addActivity(property: Property, activity: Activity, newFiles: File[]) {
        try {
            // Only under extreme usage that there could be hash collision on file names
            // Highly unlikely to happen
            await Promise.all(newFiles.map(async file => {
                const hashedName = activity.documents!.find(document => document.displayName === file.name)?.dbHashedName;
                if (!hashedName) {
                    return;
                }

                const fileStoragePath = `${property.fileStoragePath}/${hashedName}`;
                await uploadBytes(
                    ref(
                        this.storage,
                        fileStoragePath
                    ),
                    file
                )
            }));
        } finally {
            await addDoc(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    'activities'
                ),
                activity
            );
        }
    }
}