import { Timestamp } from "@angular/fire/firestore"

type PaymentStatus = 'paid' | 'unpaid' | 'partiallyPaid' | 'doNotCollect' | 'paidOut'
type StoragePath = string //Fire Storage path

export interface Invoice {
    id?: string
    name?: string
    payer?: string
    payee?: string
    dateCreated?: Timestamp
    beginDate?: Timestamp // Date when payment first become payable
    dueDate?: Timestamp // Last day to make the payment
    paymentWindow?: string
    payWithin?: number
    paymentDate?: Timestamp // Date when the payment is received
    payoutDate?: Timestamp // Date when the payment is sent to the payee
    propertyId?: string
    propertyName?: string
    status?: PaymentStatus
    proofOfPayment?: StoragePath[]
    amount?: string
    description?: string
    scheduleId?: string
}