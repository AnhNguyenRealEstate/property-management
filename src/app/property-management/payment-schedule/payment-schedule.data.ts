import { Invoice } from "../invoices/invoices.data";

export interface PaymentSchedule {
    lineItems: Invoice[]
}