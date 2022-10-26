import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from '@sendgrid/mail';
var format = require('date-format');

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

        snap.ref.update({
            'id': invoiceId,
            'scheduleId': scheduleId,
        });

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

        const invoicesAsHtml: string[] = [];
        invoicesToCollect.forEach((invoice, index) => {
            const invoiceHtml = `${index + 1}. Thu ${invoice['amount']} từ ${invoice['payee']} (${invoice['propertyName']}), bắt đầu từ ${ format.asString('dd/MM/yyyy' ,(invoice['beginDate'] as admin.firestore.Timestamp).toDate())}`;
            invoicesAsHtml.push(invoiceHtml);
        });

        if (!process.env.SENDGRID_API_KEY) {
            console.log("Cannot find SendGrid API Key");
            return Promise.resolve();
        }

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            templateId: 'invoices-to-collect',
            to: 'nguyentrungtu1996@gmail.com', // Change to your recipient
            from: 'it@anhnguyenre.com', // Change to your verified sender,
            invoicesAsHtml: invoicesAsHtml
        }

        sgMail.send(msg).then(() => {
            console.log('Mail sent')
        }).catch((error) => {
            console.error(error)
        });
    });