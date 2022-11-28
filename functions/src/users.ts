import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
import * as sgMail from '@sendgrid/mail'

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

    if (!process.env.SENDGRID_API_KEY) {
        console.log("Cannot find SendGrid API Key")
        return Promise.resolve()
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        "templateId": 'd-696c705c0dfb41668297c97bfe0209e3',
        "to": [email],
        "from": {
            "name": "Quản Lý Tài Sản",
            "email": 'it@anhnguyenre.com'
        },
        "dynamic_template_data": {
            "password": password,
            "displayName": userProfile.displayName
        }
    }

    sgMail.send(msg).then(() => {
        console.log('User credentials sent')
    }).catch(error => {
        console.error(error)
    })
}