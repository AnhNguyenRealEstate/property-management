import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore"

/**
 * After a listing's creation
 * Update id and creation date for that listing
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('under-management/{documentId}')
    .onCreate(async (snap, context) => {

        const id = context.params.documentId;
        const creationDate = Timestamp.fromDate(new Date());
        snap.ref.update(
            {
                'id': id,
                'creationDate': creationDate
            }
        );

        incrementPropertyCount(snap, 1);

        //const propertyData = snap.data();
        //await registerPropertyWithOwner(propertyData);
    });

exports.postProcessDelete = functions.region('asia-southeast2').firestore
    .document('under-management/{documentId}')
    .onDelete(async (snap, context) => {

        const id = context.params.documentId;

        await removePaymentSchedulesAndInvoices(snap.get('paymentScheduleIds') as string[]);
        await removeActivities(id);
        await removeFiles(snap.get('fileStoragePath'))
        await removeRentalExtensions(id);
        incrementPropertyCount(snap, -1);
    });

//https://firebase.google.com/docs/firestore/manage-data/delete-data#collections
async function deleteQueryBatch(db: admin.firestore.Firestore, query: admin.firestore.Query, resolve: any) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function removeActivities(propertyId: string) {
    const activitiesCollectionRef = admin.firestore().collection(`under-management/${propertyId}/activities`);
    const activitiesQuery = activitiesCollectionRef.limit(10);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(admin.firestore(), activitiesQuery, resolve).catch(reject);
    });
}

async function removePaymentSchedulesAndInvoices(paymentScheduleIds: string[]) {
    if (!paymentScheduleIds?.length) {
        return;
    }

    const batch = admin.firestore().batch();

    await Promise.all(paymentScheduleIds.map(async id => {
        const paymentSchedule = await admin.firestore().doc(`payment-schedules/${id}`).get();

        const invoiceCollection = admin.firestore().collection(`payment-schedules/${paymentSchedule.id}/invoices`);
        const invoiceCollectionQuery = invoiceCollection.limit(10);

        await new Promise((resolve, reject) => {
            deleteQueryBatch(admin.firestore(), invoiceCollectionQuery, resolve).catch(reject);
        });

        batch.delete(paymentSchedule.ref);
    }))

    await batch.commit();
}

async function removeFiles(storagePath: string) {
    const [files] = await admin.storage().bucket().getFiles({ prefix: `${storagePath}/` });
    if (files.length) {
        files.map(file => {
            file.delete();
        })
    }
}

async function removeRentalExtensions(propertyId: string) {
    const rentalExtensions = admin.firestore().collection(`rental-extension`).where('propertyId', '==', propertyId);
    const rentalExtensionsQuery = rentalExtensions.limit(10);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(admin.firestore(), rentalExtensionsQuery, resolve).catch(reject);
    });
}

function incrementPropertyCount(snap: functions.firestore.QueryDocumentSnapshot, count: number) {
    const property = snap.data();
    const propertyCategory = property['category'];
    switch (propertyCategory) {
        case 'Apartment':
            admin.firestore().doc('app-metadata/properties').update(
                { 'apartmentCount': FieldValue.increment(count) }
            );
            break;
        case 'Villa':
            admin.firestore().doc('app-metadata/properties').update(
                { 'villaCount': FieldValue.increment(count) }
            );
            break;
        case 'Townhouse':
            admin.firestore().doc('app-metadata/properties').update(
                { 'townhouseCount': FieldValue.increment(count) }
            );
            break;
        case 'Commercial':
            admin.firestore().doc('app-metadata/properties').update(
                { 'commercialCount': FieldValue.increment(count) }
            );
            break;
    }


}


// async function registerPropertyWithOwner(propertyData: admin.firestore.DocumentData | undefined) {
//     if (!propertyData) {
//         return;
//     }

//     const ownerUsername = propertyData['ownerUsername'];
//     const owner = await admin.firestore().collection('owners').where('username', '==', ownerUsername).get();
//     const ownerExists = owner.size === 1;
//     if (ownerExists) {
//         const ownerRef = owner.docs[0].ref;
//         const ownerData = (await ownerRef.get()).data();
//         if (!ownerData) {
//             return;
//         }

//         const propertiesBelongingToOwner = ownerData['propertyIDs'] as string[];
//         propertiesBelongingToOwner.push(propertyData['id']);

//         await ownerRef.update({
//             'propertyIDs': propertiesBelongingToOwner
//         });
//     } else {
//         const propertiesIDs = [];
//         propertiesIDs.push(propertyData['id']);

//         await admin.firestore().collection('owners').add({
//             contactName: (propertyData['owner'] as any)['contactName'] || '',
//             contactInfo: (propertyData['owner'] as any)['contactInfo'] || '',
//             username: (propertyData['owner'] as any)['username'] || '',
//             dateOfLastContact: (propertyData['owner'] as any)['dateOfLastContact'] || admin.firestore.Timestamp.fromDate(new Date()),
//             propertyIDs: propertiesIDs
//         });
//     }
// }