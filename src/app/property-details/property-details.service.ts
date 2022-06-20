import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { updateDoc, doc, Firestore, deleteDoc, collection, DocumentSnapshot, getDocs, limit, query, startAfter, orderBy } from '@angular/fire/firestore';
import { deleteObject, getBlob, ref, Storage } from '@angular/fire/storage';
import { lastValueFrom } from 'rxjs';
import { LoginService } from 'src/app/components/login/login.service';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Property, Activity } from '../property-management.data';

@Injectable({ providedIn: 'root' })
export class PropertyDetailsService {
    public initialNumOfActivities = 10;

    constructor(
        private firestore: Firestore,
        private storage: Storage,
        private login: LoginService
    ) { }

    async downloadDoc(docPath: string): Promise<Blob> {
        const loggedIn = lastValueFrom(this.login.loggedIn$);
        if (!loggedIn) {
            return new Blob();
        }

        return await getBlob(ref(this.storage, `${docPath}`));
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
}