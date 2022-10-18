import { Injectable } from '@angular/core';
import { deleteDoc, addDoc, doc, Firestore, getDocs, collection, limit, query, orderBy, updateDoc, Timestamp } from '@angular/fire/firestore';
import { FirestoreCollections } from 'src/app/shared/globals';
import { Activity } from '../../activities/activity.data';
import { Property } from "../property.data";

@Injectable({ providedIn: 'any' })
export class PropertyCardService {
    constructor(
        private firestore: Firestore
    ) { }

    /**
     * Remove the property and all files/activities related to it
     * @param property The property to remove
     * @returns 
     */
    async deleteProperty(property: Property) {
        if (!property.id) {
            return;
        }

        deleteDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`));
    }

    async getMostRecentActivity(property: Property) {
        const snapshot = await getDocs(
            query(
                collection(
                    doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`),
                    'activities'
                ),
                orderBy('date', 'desc'),
                limit(1)
            )
        );

        if (snapshot.docs.length) {
            return snapshot.docs[0]?.data() as Activity;
        } else {
            return undefined;
        }
    }

    async deactivateProperty(property: Property) {
        const scheduleIds = property.paymentScheduleIds
        if (scheduleIds?.length) {
            await Promise.all(scheduleIds.map(async (schedId) => {
                await updateDoc(doc(this.firestore, `${FirestoreCollections.paymentSchedules}/${schedId}`), {
                    isActive: false
                })
            }));
        }

        const managementEndDate = Timestamp.fromDate(new Date())
        property.managementEndDate = managementEndDate
        await updateDoc(doc(this.firestore, `${FirestoreCollections.underManagement}/${property.id}`), {
            managementEndDate: managementEndDate
        })

        await addDoc(
            collection(this.firestore, `${FirestoreCollections.underManagement}/${property.id}/${FirestoreCollections.activities}`),
            {
                date: Timestamp.now(),
                description: 'Huỷ/thanh lý hợp đồng thuê',
                propertyId: property.id,
                propertyName: property.name
            } as Activity
        )
    }
}