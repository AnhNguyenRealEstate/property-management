import { Timestamp } from "@angular/fire/firestore";
import { Invoice } from "../invoices/invoices.data";

export interface PaymentSchedule {
    isActive?: boolean
    beginDate?: Timestamp
    endDate?: Timestamp
    lineItems?: Invoice[]
}