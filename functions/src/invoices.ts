import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * After an invoice's creation
 * 1. Update id and name for the invoice
 * 2. Increment global counter for number of invoices
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('payment-schedules/{scheduleId}/invoices/{invoiceId}')
    .onCreate(async (snap, context) => {
        const invoiceId = context.params.invoiceId;
        const scheduleId = context.params.scheduleId;

        const appCounters = await admin.firestore().collection('app-metadata').doc('counters').get();

        const batch = admin.firestore().batch();

        batch.update(snap.ref, {
            'id': invoiceId,
            'scheduleId': scheduleId,
        });

        const increment = admin.firestore.FieldValue.increment(1);
        batch.update(appCounters.ref, {
            'invoiceCount': increment
        });

        batch.commit();
    });

// exports.emailInvoicesToCollect = functions.region('asia-southeast2')
//     .pubsub.schedule('At 08:30 on Monday').timeZone('Asia/Ho_Chi_Minh')
//     .onRun(async () => {
//         admin.firestore().collection('mail').add({
//             to: 'nguyentrungtu1996@gmail.com',
//             message: {
//                 subject: 'Anh Nguyen Customer Service - Invoces to collect',
//                 html: `TODO: implement list of invoices to collect
//                 `,
//             },
//         });
//     });