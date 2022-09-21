import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { updateDoc, doc, Firestore, deleteDoc, collection, DocumentSnapshot, getDocs, limit, query, startAfter, orderBy, getDoc, docData } from '@angular/fire/firestore';
import { deleteObject, getBlob, ref, Storage } from '@angular/fire/storage';
import { lastValueFrom } from 'rxjs';
import { LoginService } from 'src/app/login/login.service';
import { FirestoreCollections } from 'src/app/shared/globals';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { Property } from "../property-card/property-card.data";

@Injectable({ providedIn: 'root' })
export class PropertyDetailsService {
    public initialNumOfActivities = 10;
    public initialNumOfSchedules = 5;

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
                    FirestoreCollections.activities
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
                    FirestoreCollections.activities
                ),
                orderBy('date', 'desc'),
                startAfter(lastResult),
                limit(this.initialNumOfActivities)
            )
        );

        return snapshot;
    }

    async getPaymentSchedules(scheduleIds: string[]): Promise<PaymentSchedule[]> {

        const schedules = await Promise.all(scheduleIds.map(async scheduleId => {
            const ref = await getDoc(doc(this.firestore, `${FirestoreCollections.paymentSchedules}/${scheduleId}`));
            return ref.data() as PaymentSchedule;
        }));

        return schedules;
    }
}