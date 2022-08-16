import { Injectable } from '@angular/core';
import { collectionGroup, Firestore, getDocs, orderBy, query, Timestamp, where } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from "../activities-view/activity.data";

@Injectable({ providedIn: 'root' })
export class ActivityCalendarService {
    private gettingActivities$$ = new BehaviorSubject<boolean>(false);
    gettingActivities$ = this.gettingActivities$$.asObservable();

    constructor(
        private firestore: Firestore,
    ) { }

    async getActivities(ownerUsername?: string, currentDate?: Date) {
        this.gettingActivities$$.next(true);

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.activities),
            orderBy('date', 'desc')
        );

        if (currentDate) {
            const currentMonth = currentDate.getMonth();
            const monthStartDate = new Date(currentDate.getFullYear(), currentMonth, 1);
            const monthEndDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);

            q = query(q,
                where('date', '>=', monthStartDate),
                where('date', '<=', monthEndDate)
            )
        }

        if (ownerUsername) {
            q = query(q, where('owner', '==', ownerUsername));
        }

        const snapshot = await getDocs(q);
        this.gettingActivities$$.next(false);

        return snapshot.docs.map(doc => doc.data() as Activity);
    }

    async getActivitiesFrom(ownerUsername?: string, date?: Date) {
        this.gettingActivities$$.next(true);

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.activities)
        );

        if (date) {
            const currentMonth = date.getMonth();
            const monthStartDate = new Date(date.getFullYear(), currentMonth, 1);
            const monthEndDate = new Date(date.getFullYear(), currentMonth + 1, 0);

            q = query(q,
                where('date', '>=', Timestamp.fromDate(monthStartDate)),
                where('date', '<=', Timestamp.fromDate(monthEndDate)),
                orderBy('date', 'desc')
            )
        }

        if (ownerUsername) {
            q = query(q, where('owner', '==', ownerUsername));
        }

        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => doc.data() as Activity);

        this.gettingActivities$$.next(false);

        return activities;
    }
}