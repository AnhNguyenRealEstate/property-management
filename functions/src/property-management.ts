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

        return snap.ref.update(
            {
                'id': id,
                'creationDate': creationDate
            });
    });