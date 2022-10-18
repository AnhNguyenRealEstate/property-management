import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * After a payment schedule's creation
 * Update id for that schedule
 */
exports.postProcessCreation = functions.region('asia-southeast2').firestore
    .document('payment-schedules/{scheduleId}')
    .onCreate((snap, context) => {
        const scheduleId: string = context.params.scheduleId;
        return snap.ref.update(
            {
                'id': scheduleId
            }
        );
    });

exports.postProcessUpdate = functions.region('asia-southeast2').firestore
    .document('payment-schedules/{scheduleId}').onUpdate((change, context) => {
        const scheduleRef = change.after;
        const isActive: boolean = scheduleRef.data()['isActive'];
        if (!isActive) {
            deactivateInvoices(scheduleRef.id)
        }
    })

function deactivateInvoices(scheduleId: string) {
    const query = admin.firestore().collection(`payment-schedules/${scheduleId}/invoices`).limit(10)
    return new Promise((resolve, reject) => {
        markInvoicesAsDoNotCollectInBatch(admin.firestore(), query, resolve).catch(reject)
    })
}

//https://firebase.google.com/docs/firestore/manage-data/delete-data#collections
async function markInvoicesAsDoNotCollectInBatch(db: admin.firestore.Firestore, query: admin.firestore.Query, resolve: any) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        const status = doc.data()['status'];
        if(status === 'unpaid'){
            batch.update(doc.ref, {
                status: 'doNotCollect'
            });
        }
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        markInvoicesAsDoNotCollectInBatch(db, query, resolve);
    });
}