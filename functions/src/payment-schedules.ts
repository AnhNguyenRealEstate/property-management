import * as functions from "firebase-functions";


/**
 * After a payment schedule's creation
 * Update id for that schedule
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('payment-schedules/{scheduleId}')
    .onCreate((snap, context) => {
        const scheduleId = context.params.scheduleId;

        return snap.ref.update(
            {
                'id': scheduleId
            }
        );
    });