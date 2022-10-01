import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { PropertyDetailsComponent } from '../../properties/property-details/property-details.component';
import { Invoice } from '../invoices.data';
import { InvoiceListService } from './invoice-list.service';

@Component({
    selector: 'invoice-list',
    templateUrl: 'invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss']
})

export class InvoiceListComponent implements OnInit {
    @Input() invoices: Invoice[] = [];
    @Input() canEditInvoices: boolean = false;

    editableInvoices: string[] = [];

    constructor(
        public invoiceList: InvoiceListService,
        private renderer: Renderer2,
        private dialog: MatDialog
    ) { }

    ngOnInit() { }

    async showPropertyDetails(propertyId: string) {
        const property = await this.invoiceList.getProperty(propertyId);

        const config = {
            height: '90%',
            width: '80%',
            autoFocus: false,
            data: {
                property: property
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyDetailsComponent, config);
    }

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
        this.editableInvoices.push(invoice.id!);
    }

    async saveEdit(invoice: Invoice) {
        await this.invoiceList.updateInvoice(invoice);
        this.editableInvoices = this.editableInvoices.filter(id => id !== invoice.id);
    }

    invoicePaid(invoice: Invoice) {
        invoice.status = 'paid';
        invoice.paymentDate = Timestamp.fromDate(new Date());
        this.invoiceList.updateInvoice(invoice);
    }

}