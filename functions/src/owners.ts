import * as functions from "firebase-functions";

/**
 * After an owner's creation
 * Update id for that owner
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('owners/{ownerId}')
    .onCreate((snap, context) => {
        const ownerId = context.params.ownerId;

        return snap.ref.update(
            {
                'id': ownerId
            }
        );
    });