import { Component, OnInit } from '@angular/core';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { Invoice } from '../invoices.data';
import { InvoicesViewService } from './invoices-view.service';

@Component({
    selector: 'invoices-view',
    templateUrl: 'invoices-view.component.html'
})

export class InvoicesViewComponent implements OnInit {
    today = new Date();
    uncollectedInvoices: PaymentSchedule = {};
    collectedInvoices: PaymentSchedule = {};

    constructor(
        private invoicesView: InvoicesViewService
    ) { }

    async ngOnInit() {
        this.getUnpaidInvoices();
        this.getPaidInvoices();
    }

    async getUnpaidInvoices() {
        const invoices = await this.invoicesView.getUnpaidInvoices(this.today);
        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            invoice.description = `${invoice.propertyName}, thu trong vòng ${invoice.payWithin} ngày`
        }
        this.uncollectedInvoices.lineItems = invoices;
    }

    async getPaidInvoices() {
        const invoices = await this.invoicesView.getPaidInvoices(this.today);
        this.collectedInvoices.lineItems = invoices;
    }
}