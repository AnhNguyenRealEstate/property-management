import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore } from '@angular/fire/firestore';
import { updateDoc } from '@firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Owner } from "../owners-view/owner.data";

@Injectable({ providedIn: 'root' })
export class OwnerUploadService {
    private uploadInProgress$$ = new BehaviorSubject<boolean>(false);
    uploadInProgress$ = this.uploadInProgress$$.asObservable();

    constructor(
        private firestore: Firestore
    ) { }

    async upload(owner: Owner) {
        await addDoc(collection(this.firestore, FirestoreCollections.owners), owner);
    }

    async edit(owner: Owner) {
        if (!owner.id) {
            return;
        }
        
        await updateDoc(doc(this.firestore, `${FirestoreCollections.owners}/${owner.id}`), { ...owner });
    }
}