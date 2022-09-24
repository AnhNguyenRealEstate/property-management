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

exports.emailInvoicesToCollect = functions.region('asia-southeast2')
    .pubsub.schedule('every monday 08:30').timeZone('Asia/Ho_Chi_Minh')
    .onRun(async () => {

        const monday = new Date();
        const endOfWeek = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

        const mondayTimestamp = admin.firestore.Timestamp.fromDate(monday);
        const endOfWeekTimestamp = admin.firestore.Timestamp.fromDate(endOfWeek);

        const snap = await admin.firestore().collectionGroup('invoices')
            .where('beginDate', '>=', mondayTimestamp)
            .where('beginDate', '<=', endOfWeekTimestamp)
            .get();
        const invoicesToCollect = snap.docs.map(doc => doc.data());

        const invoicesAsHtml = '';
        invoicesToCollect.forEach(invoice => {
            const invoiceHtml = `<p>Collect ${invoice['amount']} from ${invoice['payee']} on ${invoice['beginDate']} within ${invoice['payWithin']} days</p>`;
            invoicesAsHtml.concat(invoiceHtml);
        });

        admin.firestore().collection('mail').add({
            to: 'nguyentrungtu1996@gmail.com',
            message: {
                subject: 'Anh Nguyen RE Customer Service - Invoces to collect this week',
                html: `
                <p>Good morning,</p>
                <br>
                <p>Here is a list of invoices to be collected for this week:</p>
                ${invoicesAsHtml}
                <br>
                <p>Have a good day!</p>
                `,
            },
        });
    });