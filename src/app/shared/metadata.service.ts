import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from './globals';

export interface PropertiesMetadata {
    apartmentCount: number
    villaCount: number
    townhouseCount: number
    commercialCount: number
}

@Injectable({ providedIn: 'root' })
export class MetadataService {
    private propertiesMetadata = 'properties';
    private invoicesMetadata = 'invoices';
    private activitiesMetadata = 'activities';

    private propertiesMetadata$$ = new BehaviorSubject<PropertiesMetadata>({} as PropertiesMetadata);
    propertiesMetadata$ = this.propertiesMetadata$$.asObservable();

    constructor(
        private firestore: Firestore
    ) {
        this.getPropertiesMetadata();
    }

    private async getPropertiesMetadata() {
        const snapshot = await getDoc(doc(this.firestore, `${FirestoreCollections.appMetadata}/${this.propertiesMetadata}`));
        const metadata = snapshot.data() as PropertiesMetadata;
        this.propertiesMetadata$$.next(metadata);
    }
}