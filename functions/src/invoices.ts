import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// Use require to avoid needing type declarations during build
const nodemailer = require('nodemailer');
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

// Local preview: returns the rendered HTML without sending an email
exports.previewInvoicesEmail = functions.region('asia-southeast2')
    .https.onRequest(async (req, res) => {
        try {
            if (process.env.FUNCTIONS_EMULATOR !== 'true') {
                res.status(403).send('Preview is only available in emulator');
                return;
            }
            const useMock = (req.query.mock === 'true');
            const appUrl = process.env.APP_URL || '#';
            let invoices: any[];
            if (useMock) {
                invoices = sampleInvoices();
            } else {
                const info = await prepareEmailInfo();
                invoices = info.invoices;
            }
            const html = buildHtmlTemplate(invoices, { appUrl });
            res.set('Content-Type', 'text/html; charset=utf-8').status(200).send(html);
        } catch (e: any) {
            res.status(500).send(e?.message || 'Error generating preview');
        }
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

    // Build SMTP transporter using env config
    const transporter = createSmtpTransport();

    const fromAddress = process.env.DEFAULT_FROM || 'it@anhnguyenre.com';
    const fromName = process.env.DEFAULT_FROM_NAME || 'Quản Lý Tài Sản';
    const appUrl = process.env.APP_URL || '#';

    const html = buildHtmlTemplate(emailInfo.invoices, { appUrl });
    const text = buildTextTemplate(emailInfo.invoices, { appUrl });

    await transporter.sendMail({
        to: emailInfo.recipients,
        from: { name: fromName, address: fromAddress },
        subject: 'Khoản thu trong tuần',
        html,
        text
    });
}

function createSmtpTransport() {
    const uri = process.env.SMTP_CONNECTION_URI;
    if (uri) {
        return nodemailer.createTransport(uri);
    }
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const secure = (process.env.SMTP_SECURE ?? 'true') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host) {
        throw new Error('SMTP not configured. Set SMTP_CONNECTION_URI or SMTP_HOST.');
    }
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    });
}

function buildTextTemplate(invoices: any[], opts: { appUrl: string }) {
    const lines = [
        'Chào buổi sáng!',
        '',
        'Đây là danh sách các khoản cần thu trong tuần, dựa theo dữ liệu từ hệ thống.',
        '',
        'Bên trả | Số tiền | Bên nhận | Ngày thu',
        '------------------------------------------------------------',
        ...invoices.map((inv: any) => `${inv.payer} | ${inv.amount} | ${inv.payee} | ${inv.beginDate}`),
        '',
        `Xem chi tiết: ${opts.appUrl}`
    ];
    return lines.join('\n');
}

function buildHtmlTemplate(invoices: any[], opts: { appUrl: string }) {
    const rows = invoices.map((inv: any) => `
        <tr>
          <td style="padding:12px 16px; vertical-align:top; width:36%">${toMultiline(inv.payer || '')}</td>
          <td style="padding:12px 16px; text-align:right; white-space:nowrap; width:18%">${escapeHtml(inv.amount || '')}</td>
          <td style="padding:12px 16px; vertical-align:top; width:28%">${toMultiline(inv.payee || '')}</td>
          <td style="padding:12px 16px; text-align:right; white-space:nowrap; width:18%">${escapeHtml(inv.beginDate || '')}</td>
        </tr>
        <tr>
          <td colspan="4" style="border-bottom:1px solid #cfcfcf"></td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Khoản thu trong tuần</title>
  <style>
    body { margin:0; padding:0; background:#f6f6f6; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:#222 }
    .container { max-width:760px; margin:0 auto; background:#ffffff }
    .brand { background:#f7dede; padding:24px 28px }
    .brand h1 { margin:0; font-size:24px; font-weight:700; color:#222 }
    .brand p { margin:4px 0 0; font-size:16px; color:#333 }
    .content { padding:24px 28px }
    .muted { color:#555 }
    .table { width:100%; border-collapse:collapse; margin-top:24px; font-size:15px }
    .thead th { text-align:left; padding:12px 16px; border-top:1px solid #cfcfcf; border-bottom:1px solid #cfcfcf; color:#111; font-weight:600 }
    a { color:#1a73e8; text-decoration:none }
    @media (max-width: 520px) {
      .brand, .content { padding:18px }
      .thead th, .table td { padding:10px 12px }
    }
  </style>
  <!--[if mso]>
    <style>
      .table, .table td, .thead th { font-family: Arial, sans-serif !important; }
    </style>
  <![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="brand">
        <h1>Anh Nguyen Real Estate</h1>
        <p class="muted">Quản Lý Tài Sản</p>
      </div>
      <div class="content">
        <p>Chào buổi sáng!</p>
        <p>Đây là danh sách các khoản cần thu trong tuần, dựa theo dữ liệu từ <a href="${opts.appUrl}">hệ thống</a>.</p>

        <table class="table" role="table" aria-label="Invoices">
          <thead class="thead">
            <tr>
              <th style="width:36%">Bên trả</th>
              <th style="width:18%; text-align:right">Số tiền</th>
              <th style="width:28%">Bên nhận</th>
              <th style="width:18%; text-align:right">Ngày thu</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(str: string) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sampleInvoices() {
    return [
        { payer: 'MR OAKLEY DAVID\nSTUART, MRS\nOAKLEY ANNA\nMONIKA', amount: '3.150 USD', payee: 'HOÀNG MỸ NHUNG', beginDate: '30/06/2025' },
        { payer: 'CTY TNHH BĐS\nANH NGUYỄN/\nANH NGUYEN REAL ESTATE\nCOMPANY LIMITED', amount: '92.000.000 VND', payee: 'Bà: HUỲNH NGUYỆT THU', beginDate: '30/06/2025' },
        { payer: 'VPBANK SMBC FINANCE\nCOMPANY LIMITED', amount: '180.000.000 VND', payee: 'HOÀNG MINH HUỆ CHI', beginDate: '30/06/2025' },
    ];
}

function toMultiline(str: string) {
    return escapeHtml(String(str)).replace(/\n/g, '<br/>');
}
