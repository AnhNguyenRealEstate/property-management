import { Timestamp } from "@angular/fire/firestore";
import { Invoice } from "../invoices/invoices.data";

export interface PaymentSchedule {
    id?: string
    isActive?: boolean
    beginDate?: Timestamp
    endDate?: Timestamp
    description?: string
    lineItems?: Invoice[]
}