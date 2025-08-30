import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
// Use require to avoid needing type declarations during build
const nodemailer = require('nodemailer')

// Local preview: returns rendered HTML of the credentials email (emulator only)
exports.previewUserCredentialsEmail = functions.region('asia-southeast2')
    .https.onRequest(async (req, res) => {
        try {
            if (process.env.FUNCTIONS_EMULATOR !== 'true') {
                res.status(403).send('Preview is only available in emulator')
                return
            }
            const appUrl = process.env.APP_URL || '#'
            const displayName = String(req.query.displayName || 'Người dùng mới')
            const email = String(req.query.email || 'user@example.com')
            const password = String(req.query.password || '123456')
            const html = buildCredentialsHtml({ displayName, email, password, appUrl })
            res.set('Content-Type', 'text/html; charset=utf-8').status(200).send(html)
        } catch (e: any) {
            res.status(500).send(e?.message || 'Error generating preview')
        }
    })

exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('users/{userName}')
    .onCreate(async (snap, context) => {
        const isEmulated = process.env.FUNCTIONS_EMULATOR === "true"


        const userName = context.params.userName
        const userProfile = snap.data()

        // Generate 6 digit random password
        let password: string
        if (isEmulated) {
            password = 'secret'
        } else {
            password = Math.floor(100000 + Math.random() * 900000).toString()
        }

        await getAuth()
            .createUser({
                email: userName,
                emailVerified: false,
                password: password,
                displayName: userProfile.displayName,
                disabled: false
            })
            .then(userRecord => {
                console.log('Successfully created new user:', userRecord.uid)
            })
            .catch(error => {
                console.log('Error creating new user:', error)
            })

        if (!isEmulated) {
            await emailLoginCredentials(userName, password, userProfile)
        }
    })

exports.postProcessDelete = functions.region('asia-southeast2').firestore
    .document('users/{userName}')
    .onDelete(async (snap, context) => {
        const record = await getAuth().getUserByEmail(context.params.userName).catch(error => console.log(error))
        if (record?.uid) {
            getAuth().deleteUser(record.uid).catch(error => console.log(error))
        }
    })

async function emailLoginCredentials(email: string, password: string, userProfile: any) {
    const transporter = createSmtpTransport()

    const fromAddress = process.env.DEFAULT_FROM || 'it@anhnguyenre.com'
    const fromName = process.env.DEFAULT_FROM_NAME || 'Quản Lý Tài Sản'
    const appUrl = process.env.APP_URL || '#'

    const html = buildCredentialsHtml({
        displayName: userProfile.displayName || email,
        email,
        password,
        appUrl
    })
    const text = buildCredentialsText({
        displayName: userProfile.displayName || email,
        email,
        password,
        appUrl
    })

    await transporter.sendMail({
        to: [email],
        from: { name: fromName, address: fromAddress },
        subject: 'Thông tin đăng nhập hệ thống',
        html,
        text
    })
}

function createSmtpTransport() {
    const uri = process.env.SMTP_CONNECTION_URI
    if (uri) {
        return nodemailer.createTransport(uri)
    }
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465
    const secure = (process.env.SMTP_SECURE ?? 'true') === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    if (!host) {
        throw new Error('SMTP not configured. Set SMTP_CONNECTION_URI or SMTP_HOST.')
    }
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    })
}

function buildCredentialsText({ displayName, email, password, appUrl }: { displayName: string, email: string, password: string, appUrl: string }) {
    return [
        `Xin chào ${displayName},`,
        '',
        'Tài khoản của bạn đã được tạo trong hệ thống Quản Lý Tài Sản.',
        `Email: ${email}`,
        `Mật khẩu tạm thời: ${password}`,
        '',
        `Đăng nhập: ${appUrl}`,
        '',
        'Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu sử dụng.',
    ].join('\n')
}

function buildCredentialsHtml({ displayName, email, password, appUrl }: { displayName: string, email: string, password: string, appUrl: string }) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thông tin đăng nhập</title>
  <style>
    body { margin:0; padding:0; background:#f6f6f6; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; color:#222 }
    .container { max-width:760px; margin:0 auto; background:#ffffff }
    .brand { background:#f7dede; padding:24px 28px }
    .brand h1 { margin:0; font-size:24px; font-weight:700; color:#222 }
    .brand p { margin:4px 0 0; font-size:16px; color:#333 }
    .content { padding:24px 28px; font-size:15px }
    .muted { color:#555 }
    .kvt { background:#fafafa; border:1px solid #e5e5e5; padding:12px 14px; border-radius:8px; margin:12px 0 }
    a { color:#1a73e8; text-decoration:none }
    @media (max-width: 520px) { .brand, .content { padding:18px } }
  </style>
  <!--[if mso]>
    <style> .content { font-family: Arial, sans-serif !important; } </style>
  <![endif]-->
  </head>
  <body>
    <div class="container">
      <div class="brand">
        <h1>Anh Nguyen Real Estate</h1>
        <p class="muted">Quản Lý Tài Sản</p>
      </div>
      <div class="content">
        <p>Xin chào ${escapeHtml(displayName)},</p>
        <p>Tài khoản của bạn đã được tạo trong hệ thống. Thông tin đăng nhập:</p>
        <div class="kvt">
          <div><strong>Email:</strong> ${escapeHtml(email)}</div>
          <div><strong>Mật khẩu tạm thời:</strong> ${escapeHtml(password)}</div>
        </div>
        <p>Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đầu sử dụng.</p>
        <p><a href="${escapeHtml(appUrl)}">Đăng nhập vào hệ thống</a></p>
      </div>
    </div>
  </body>
</html>`
}

function escapeHtml(str: string) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
