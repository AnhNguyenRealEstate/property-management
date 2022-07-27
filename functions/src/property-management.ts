import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * After a listing's creation
 * Update id and creation date for that listing
 */
exports.postProcessCreation = functions.region('asia-southeast1').firestore
    .document('under-management/{documentId}')
    .onCreate(async (snap, context) => {

        const id = context.params.documentId;
        const creationDate = admin.firestore.Timestamp.fromDate(new Date());

        await snap.ref.update(
            {
                'id': id,
                'creationDate': creationDate
            }
        );

        const propertyData = (await snap.ref.get()).data();
        await registerPropertyWithOwner(propertyData);
    });

async function registerPropertyWithOwner(propertyData: admin.firestore.DocumentData | undefined) {
    if (!propertyData) {
        return;
    }

    const ownerUsername = propertyData['ownerUsername'];
    const owner = await admin.firestore().collection('owners').where('username', '==', ownerUsername).get();
    const ownerExists = owner.size === 1;
    if (ownerExists) {
        const ownerRef = owner.docs[0].ref;
        const ownerData = (await ownerRef.get()).data();
        if (!ownerData) {
            return;
        }

        const propertiesBelongingToOwner = ownerData['propertyIDs'] as string[];
        propertiesBelongingToOwner.push(propertyData['id']);

        await ownerRef.update({
            'propertyIDs': propertiesBelongingToOwner
        });
    } else {
        const propertiesIDs = [];
        propertiesIDs.push(propertyData['id']);

        await admin.firestore().collection('owners').add({
            contactName: (propertyData['owner'] as any)['contactName'] || '',
            contactInfo: (propertyData['owner'] as any)['contactInfo'] || '',
            username: (propertyData['owner'] as any)['username'] || '',
            dateOfLastContact: (propertyData['owner'] as any)['dateOfLastContact'] || admin.firestore.Timestamp.fromDate(new Date()),
            propertyIDs: propertiesIDs
        });
    }
}