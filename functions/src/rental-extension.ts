import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore"

exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('rental_extension/{extension_id}')
    .onCreate(async (snap, context) => {
        const extensionId = context.params.extension_id;

        await snap.ref.update(
            {
                'id': extensionId,
            }
        );
    });

exports.extendRentalContracts = functions.region('asia-southeast2').pubsub.
    schedule('every day 00:00').timeZone('Asia/Ho_Chi_Minh').onRun(async () => {
        const todayAsDate = new Date();
        todayAsDate.setHours(0, 0, 0, 0);

        const today = Timestamp.fromDate(todayAsDate);
        const tomorrow = Timestamp.fromDate(new Date(todayAsDate.getFullYear(), todayAsDate.getMonth(), todayAsDate.getDate() + 1))
        const rentalExtensionsSnap = await admin.firestore().collection(`rental-extension`)
            .where('startDate', '>=', today)
            .where('startDate', '<', tomorrow).get()

        console.log(`Extending ${rentalExtensionsSnap.size} contracts`)

        await Promise.all(rentalExtensionsSnap.docs.map(async (doc) => {
            // Extend contract and then remove the extension doc
            const extensionData = doc.data();
            await updateProperty(extensionData);

            await doc.ref.delete()
        }))

    })

async function updateProperty(extensionData: any) {
    const propertySnap = await admin.firestore().collection('under-management').doc(extensionData['propertyId']).get()

    if (!propertySnap.exists) {
        return;
    }

    await propertySnap.ref.update({
        managementStartDate: extensionData['startDate'],
        managementEndDate: extensionData['endDate'],
        ownerName: extensionData['ownerName'],
        tenantName: extensionData['tenantName']
    })
}