import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Invoice } from '../invoices.data';
import { InvoiceListService } from './invoice-list.service';

@Component({
    selector: 'invoice-list',
    templateUrl: 'invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss']
})

export class InvoiceListComponent {
    @Input() invoices: Invoice[] = [];
    @Input() canEditInvoices: boolean = false;

    invoicesBeingEdited: string[] = [];

    constructor(
        public invoiceList: InvoiceListService,
        private renderer: Renderer2
    ) { }

    showActions(...btns: HTMLDivElement[]) {
        btns.forEach(btn => {
            this.renderer.removeStyle(btn, 'display');
        })
    }

    hideActions(...btns: HTMLDivElement[]) {
        btns.forEach(btn => {
            this.renderer.setStyle(btn, 'display', 'none');
        })
    }

    editInvoice(invoicePanel: MatExpansionPanel, invoice: Invoice) {
        invoicePanel.open();
        this.invoicesBeingEdited.push(invoice.id!);
    }

    async saveEdit(invoice: Invoice) {
        await this.invoiceList.updateInvoice(invoice);
        this.invoicesBeingEdited = this.invoicesBeingEdited.filter(id => id !== invoice.id);
    }

    async cancelEdit(invoice: Invoice) {
        this.invoicesBeingEdited = this.invoicesBeingEdited.filter(id => id !== invoice.id);
    }

    paymentReceived(invoice: Invoice) {
        invoice.status = 'paid';
        invoice.paymentDate = Timestamp.fromDate(new Date());
        this.invoiceList.markInvoiceAsPaid(invoice);
    }

    invoicePaidOut(invoice: Invoice) {
        invoice.status = 'paidOut';
        invoice.payoutDate = Timestamp.fromDate(new Date());
        this.invoiceList.markInvoiceAsPaidOut(invoice);
    }

}