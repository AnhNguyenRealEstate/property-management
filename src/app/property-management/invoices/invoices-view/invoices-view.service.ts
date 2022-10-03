import { Injectable } from '@angular/core';
import { collection, collectionGroup, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { orderBy } from '@firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Invoice } from '../invoices.data';


@Injectable({ providedIn: 'root' })
export class InvoicesViewService {

    private gettingInvoices$$ = new BehaviorSubject<boolean>(false);
    gettingInvoices$ = this.gettingInvoices$$.asObservable();

    constructor(
        private firestore: Firestore
    ) { }

    async getUnpaidInvoices(currentDate?: Date): Promise<Invoice[]> {
        this.gettingInvoices$$.next(true);

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.invoices),
            orderBy('beginDate', 'desc')
        );

        if (currentDate) {
            const currentMonth = currentDate.getMonth();
            const monthEndDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);

            q = query(
                q,
                where('beginDate', '<=', monthEndDate),
                where('status', '==', 'unpaid')
            )
        }

        const snapshot = await getDocs(q);
        this.gettingInvoices$$.next(false);

        return snapshot.docs.map(doc => doc.data() as Invoice);
    }

    async getPaidInvoices(currentDate: Date): Promise<Invoice[]> {
        this.gettingInvoices$$.next(true);

        const currentMonth = currentDate.getMonth();
        const monthEndDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);

        let q = query(
            collectionGroup(this.firestore, FirestoreCollections.invoices),
            orderBy('beginDate', 'desc'),
            where('beginDate', '<=', monthEndDate),
            where('status', '==', 'paid')
        )

        const snapshot = await getDocs(q);
        this.gettingInvoices$$.next(false);

        return snapshot.docs.map(doc => doc.data() as Invoice);
    }

}