import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { getDocs } from '@firebase/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { UserProfile } from '../users.data';

@Injectable({ providedIn: 'root' })
export class UsersViewService {
    constructor(
        private firestore: Firestore
    ) { }

    async getUserProfiles(): Promise<UserProfile[]> {
        const snap = await getDocs(collection(this.firestore, FirestoreCollections.users))
        const userProfiles = snap.docs.map(doc => doc.data() as UserProfile)
        return userProfiles
    }

    async updateUser(user: UserProfile) {
        await updateDoc(
            doc(this.firestore, `${FirestoreCollections.users}/${user.userName}`),
            { ...user }
        )
    }

    async createUser(user: UserProfile) {
        const usersColl = collection(this.firestore, FirestoreCollections.users)
        await setDoc(doc(usersColl, `${user.userName}`), user)
    }

    async deleteUser(user: UserProfile) {
        await deleteDoc(doc(this.firestore, `${FirestoreCollections.users}/${user.userName}`))
    }
}