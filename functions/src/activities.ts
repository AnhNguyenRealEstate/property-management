import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * After an activity's creation
 * Update id for that activity
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('under-management/{propertyId}/activities/{activityId}')
    .onCreate(async (snap, context) => {
        const activityId = context.params.activityId;
        const propertyId = context.params.propertyId;

        const propertyDoc = (await admin.firestore().doc(`under-management/${propertyId}`).get()).data();
        const fileStoragePath = propertyDoc ? propertyDoc['fileStoragePath'] : '';

        return snap.ref.update(
            {
                'id': activityId,
                'propertyId': propertyId,
                'propertyName': propertyDoc ? propertyDoc['name'] : '',
                'fileStoragePath': fileStoragePath
            }
        );
    });

exports.postProcessDelete = functions.region('asia-southeast2').firestore
    .document('under-management/{propertyId}/activities/{activityId}')
    .onDelete((snap, context) => {
        const fileStoragePath = snap.get('fileStoragePath');
        const documents: any[] = snap.get('documents');

        if (!(fileStoragePath && documents?.length)) {
            return Promise.resolve();
        }

        return Promise.all(documents.map(async (document: any) => {
            const dbHashedName = document['dbHashedName'];
            admin.storage().bucket().file(`${fileStoragePath}/${dbHashedName}`).delete();
        }))
    });
