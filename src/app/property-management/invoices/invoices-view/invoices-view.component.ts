import { Component, OnInit } from '@angular/core';
import { Invoice } from '../invoices.data';
import { InvoicesViewService } from './invoices-view.service';

export interface InvoicesByDate {
    date: Date
    invoices: Invoice[]
}

@Component({
    selector: 'invoices-view',
    templateUrl: 'invoices-view.component.html'
})

export class InvoicesViewComponent implements OnInit {
    invoiceCollections: InvoicesByDate[] = [];
    today = new Date();

    constructor(
        private invoicesView: InvoicesViewService
    ) { }

    async ngOnInit() {
        await this.categorizeInvoicesByDate();
    }

    async categorizeInvoicesByDate() {
        const invoices = await this.invoicesView.getInvoices(this.today);
        if (!invoices.length) {
            return;
        }

        let currentDate = invoices[0].beginDate?.toDate();
        if (!currentDate) {
            throw new Error(`Invoice ${invoices[0].name} has no begin date`);
        }

        let currentInvoiceCollection: Invoice[] = [];
        for (let i = 0; i < invoices.length; i++) {
            const currentInvoice = invoices[i];

            if (!currentInvoice.beginDate) {
                continue;
            }

            const startNewCollection = currentDate != currentInvoice.beginDate.toDate();
            if (startNewCollection) {
                this.invoiceCollections.push({
                    date: currentDate,
                    invoices: currentInvoiceCollection
                });

                currentDate = currentInvoice.beginDate.toDate();
                currentInvoiceCollection = [];

            } else {
                currentInvoiceCollection.push(currentInvoice);
            }
        }
    }
}