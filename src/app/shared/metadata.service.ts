import { Injectable } from '@angular/core';
import { collection, doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirestoreCollections, FirestoreDocs } from './globals';

@Injectable({ providedIn: 'root' })
export class MetadataService {
    private _locations$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    private _locations$ = this._locations$$.asObservable();

    public metadataKeys = Object.freeze({
        locations: "locations"
    });

    constructor(private firestore: Firestore) {
        const listingMetadataDoc = doc(collection(this.firestore, FirestoreCollections.metadata), FirestoreDocs.listingMetadata);
        onSnapshot(listingMetadataDoc, dbResponse => {
            const metadata = dbResponse.data() as any;

            const locations = metadata[this.metadataKeys.locations];
            if (locations?.length) {
                this._locations$$.next(locations);
            }
        })
    }

    locations(): Observable<string[]> {
        return this._locations$;
    }
}