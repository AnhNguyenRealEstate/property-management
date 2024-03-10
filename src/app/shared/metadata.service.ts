import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from './globals';
import { Property } from '../property-management/properties/property.data';

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
        this.getPropertiesMetadata()
    }

    private async getPropertiesMetadata() {

        const activeApartmentContractsCount = (await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.underManagement),
                where('category', '==', 'Apartment')
            )
        )).
            docs.map(doc => doc.data() as Property)
            .filter(prop => prop.managementEndDate && prop.managementEndDate?.toDate() > new Date()).length

        const activeVillaContractsCount = (await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.underManagement),
                where('category', '==', 'Villa')
            )
        )).
            docs.map(doc => doc.data() as Property)
            .filter(prop => prop.managementEndDate && prop.managementEndDate?.toDate() > new Date()).length

        const activeTownhouseContractsCount = (await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.underManagement),
                where('category', '==', 'Townhouse')
            )
        )).
            docs.map(doc => doc.data() as Property)
            .filter(prop => prop.managementEndDate && prop.managementEndDate?.toDate() > new Date()).length

        const activeCommercialContractsCount = (await getDocs(
            query(
                collection(this.firestore, FirestoreCollections.underManagement),
                where('category', '==', 'Commercial')
            )
        )).
            docs.map(doc => doc.data() as Property)
            .filter(prop => prop.managementEndDate && prop.managementEndDate?.toDate() > new Date()).length

        const metadata: PropertiesMetadata = {
            apartmentCount: activeApartmentContractsCount,
            villaCount: activeVillaContractsCount,
            townhouseCount: activeTownhouseContractsCount,
            commercialCount: activeCommercialContractsCount
        }

        this.propertiesMetadata$$.next(metadata);
    }
}