import * as functions from "firebase-functions";

/**
 * After an activity's creation
 * Update id for that activity
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