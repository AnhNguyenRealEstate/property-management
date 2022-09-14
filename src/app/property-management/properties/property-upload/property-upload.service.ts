import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, Timestamp } from '@angular/fire/firestore';
import { ref, Storage, uploadBytes } from '@angular/fire/storage';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { FirebaseStorageConsts, FirestoreCollections } from 'src/app/shared/globals';
import { environment } from 'src/environments/environment';
import { Property } from '../property-card/property-card.data';
import { ContractData } from './property-upload.data';

@Injectable({ providedIn: 'root' })
export class PropertyUploadService {
    private endpoint = environment.contractExtractorEndpoint;

    private extracting$$ = new BehaviorSubject<boolean>(false);
    extracting$ = this.extracting$$.asObservable();

    private uploading$$ = new BehaviorSubject<boolean>(false);
    uploading$ = this.uploading$$.asObservable(); 

    constructor(
        private httpClient: HttpClient,
        private firestore: Firestore,
        private storage: Storage
    ) { }

    async extractContractData(data: FormData): Promise<ContractData | undefined> {
        this.extracting$$.next(true);

        try {
            const dataIsValid = data.has('contract') && data.has('contract_type')
            if (!dataIsValid) {
                return;
            }

            return await firstValueFrom(this.httpClient.post(this.endpoint, data)) as ContractData
        } finally {
            this.extracting$$.next(false);
        }
    }

    async uploadProperty(property: Property, uploadedFiles: File[]): Promise<string> {
        function createFileStoragePath(property: Property) {
            const date = new Date();
            const folderName =
                `${property.name?.substring(0, 5)}-${property.category}-${date.getMonth()}${date.getDate()}-${Math.random() * 1000000}`;
            return `${FirebaseStorageConsts.underManagement}/${folderName}`;
        }

        property.fileStoragePath = createFileStoragePath(property);
        await this.storeFiles(uploadedFiles, property);

        const docRef = await addDoc(collection(this.firestore, FirestoreCollections.underManagement), property);
        return docRef.id;
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
}