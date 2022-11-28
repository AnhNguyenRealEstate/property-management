import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from '@sendgrid/mail';
import { Timestamp } from "firebase-admin/firestore"
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
        await emailInvoicesToCollect();
    });

async function prepareEmailInfo() {
    const appMetadataSnap = await admin.firestore().collection('app-metadata').doc('invoices').get();
    if (!appMetadataSnap.exists) {
        throw new Error("No metadata!");
    }

    const invoicesMetadata = appMetadataSnap.data();
    const recipients: string[] = invoicesMetadata ? invoicesMetadata['emailList'] as string[] : [];

    if (!recipients?.length) {
        throw new Error("Recipient list is empty!");
    }

    const monday = new Date();
    const endOfWeek = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);

    const mondayTimestamp = Timestamp.fromDate(monday);
    const endOfWeekTimestamp = Timestamp.fromDate(endOfWeek);

    const snap = await admin.firestore().collectionGroup('invoices')
        .where('beginDate', '>=', mondayTimestamp)
        .where('beginDate', '<=', endOfWeekTimestamp)
        .get();
    const invoicesToCollect = snap.docs.map(doc => doc.data())
        .filter(invoice => (invoice['status'] === 'unpaid') || (invoice['status'] === 'partiallyPaid'));

    const invoices: any[] = [];
    invoicesToCollect.forEach((invoice, _) => {
        invoices.push(
            {
                payer: invoice['payer'],
                payee: invoice['payee'],
                amount: invoice['amount'],
                beginDate: format.asString('dd/MM/yyyy', (invoice['beginDate'] as Timestamp).toDate())
            }
        );
    });

    return {
        recipients: recipients,
        invoices: invoices
    }
}

async function emailInvoicesToCollect() {
    const emailInfo = await prepareEmailInfo();

    if (!emailInfo.invoices.length) {
        return;
    }

    if (!process.env.SENDGRID_API_KEY) {
        console.log("Cannot find SendGrid API Key");
        return Promise.resolve();
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        "templateId": 'd-097312d35e3f497bb7976fa562306b6b',
        "to": emailInfo.recipients,
        "from": {
            "name": "Quản Lý Tài Sản",
            "email": 'it@anhnguyenre.com'
        },
        "dynamic_template_data": {
            "invoices": emailInfo.invoices
        }
    }

    sgMail.send(msg).then(() => {
        console.log('Mail sent')
    }).catch((error) => {
        console.error(error)
    });
}