import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, DocumentSnapshot, Firestore, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { deleteObject, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
import { Owner } from '../../owners/owner.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from "../property.data";

@Injectable({ providedIn: 'root' })
export class PropertyUploadService {
    public initialNumOfActivities = 10;

    constructor(
        private auth: Auth,
        private firestore: Firestore,
        private storage: Storage
    ) { }

    async editProperty(property: Property, newFiles: File[], deletedFiles: UploadedFile[], deletedActivities: Activity[]) {
        property.lastModifiedBy = this.auth.currentUser?.displayName || this.auth.currentUser?.email || '';

        if (deletedFiles.length) {
            deletedFiles.map((fileToDelete) => {
                deleteObject(ref(this.storage, `${property.fileStoragePath}/${fileToDelete.dbHashedName}`));
            });
        }

        if (deletedActivities.length) {
            deletedActivities.map(activity => {
                this.removeActivity(property, activity);
            });
        }

        await this.storeFiles(newFiles, property);

        await updateDoc(
            doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
            { ...property }
        );
    }

    private async storeFiles(files: File[], property: Property) {
        if (!files.length) return;

        await Promise.all(files.map(async (file) => {
            const docToUpload = property.documents!.find(document => document.displayName === file.name);
            const hashedName = docToUpload?.dbHashedName;
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
            );

            docToUpload.date = Timestamp.now();
        }));
    }

    async getActivities(property: Property) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    'activities'
                ),
                orderBy('date', 'desc'),
                limit(this.initialNumOfActivities)
            )
        );
        return snapshot;
    }

    async getMoreActivities(property: Property, lastResult: DocumentSnapshot) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    'activities'
                ),
                orderBy('date', 'desc'),
                startAfter(lastResult),
                limit(this.initialNumOfActivities)
            )
        );

        return snapshot;
    }

    async removeActivity(property: Property, activityToRemove: Activity) {
        try {
            if (activityToRemove.documents?.length) {
                await Promise.all(activityToRemove.documents?.map(async docToRemove => {
                    const fileStoragePath = `${property.fileStoragePath}/${docToRemove.dbHashedName}`;
                    await deleteObject(
                        ref(
                            this.storage,
                            `${fileStoragePath}`
                        )
                    ).catch();
                }));
            }
        } finally {
            await deleteDoc(
                doc(
                    collection(
                        doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                        'activities'
                    ),
                    activityToRemove.id
                )
            );
        }
    }

    async getOwnerInformation(username: string): Promise<Owner> {
        const snapshot = await getDocs(query(
            collection(this.firestore, FirestoreCollections.owners),
            where('username', '==', username))
        );

        if (snapshot.docs.length === 1) {
            return snapshot.docs[0].data() as Owner;
        } else {
            return {} as Owner
        }
    }
}