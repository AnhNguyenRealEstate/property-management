import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, DocumentSnapshot, Firestore, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where } from '@angular/fire/firestore';
import { deleteObject, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { UserProfileService } from 'src/app/property-management/users/users.service';
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
        private userProfile: UserProfileService
    ) { }

    async editProperty(property: Property) {
        property.lastModifiedBy = this.auth.currentUser?.displayName || this.auth.currentUser?.email || '';

        await updateDoc(
            doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
            { ...property }
        );

        await addDoc(
            collection(this.firestore, `${FirestoreCollections.underManagement}/${property.id}/${FirestoreCollections.activities}`),
            {
                propertyId: property.id,
                propertyName: property.name,
                date: Timestamp.now(),
                type: 'propertyEdit',
                description: `Sửa thông tin`,
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        );
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