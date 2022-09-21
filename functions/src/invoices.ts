import * as functions from "firebase-functions";

/**
 * After an invoice's creation
 * Update id for that invoice
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('payment-schedules/{scheduleId}/invoices/{invoiceId}')
    .onCreate((snap, context) => {
        const invoiceId = context.params.invoiceId;

        return snap.ref.update(
            {
                'id': invoiceId
            }
        );
    });