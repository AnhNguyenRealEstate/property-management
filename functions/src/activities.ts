import * as functions from "firebase-functions";

/**
 * After an inquiry's creation
 * Update id and creation date for that inquiry
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('under-management/{propertyId}/activities/{activityId}')
    .onCreate((snap, context) => {
        const activityId = context.params.activityId;

        return snap.ref.update(
            {
                'id': activityId
            }
        );
    });