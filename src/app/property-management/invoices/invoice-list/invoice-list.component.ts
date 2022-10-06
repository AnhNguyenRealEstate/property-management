import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Invoice } from '../invoices.data';
import { InvoiceListService } from './invoice-list.service';
import { DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
@Component({
    selector: 'invoice-list',
    templateUrl: 'invoice-list.component.html',
    styleUrls: ['./invoice-list.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useClass: NativeDateAdapter,
            deps: [MAT_DATE_LOCALE]
        },
    ]
})
export class InvoiceListComponent {
    @Input() invoices: Invoice[] = [];
    @Input() canEditInvoices: boolean = false;

    @Output() paymentReceived: EventEmitter<Invoice> = new EventEmitter();
    @Output() paidOut: EventEmitter<Invoice> = new EventEmitter();

    invoicesBeingEdited: string[] = [];

    constructor(
        public invoiceList: InvoiceListService,
        private renderer: Renderer2,
        private snackbar: MatSnackBar,
        private translate: TranslateService
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

    async invoicePaymentReceived(invoice: Invoice) {
        invoice.status = 'paid';
        invoice.paymentDate = Timestamp.fromDate(new Date());
        await this.invoiceList.markInvoiceAsPaid(invoice);
        this.paymentReceived.emit(invoice);

        this.snackbar.open(
            this.translate.instant(
                'invoice_list.payment_received_msg',
                { from: invoice.payer, propertyName: invoice.propertyName }
            ),
            this.translate.instant('invoice_list.dismiss_msg'),
            {
                duration: 7000
            }
        );
    }

    async invoicePaidOut(invoice: Invoice) {
        invoice.status = 'paidOut';
        invoice.payoutDate = Timestamp.fromDate(new Date());
        await this.invoiceList.markInvoiceAsPaidOut(invoice);
        this.paidOut.emit(invoice);

        this.snackbar.open(
            this.translate.instant('invoice_list.invoice_paid_out', { to: invoice.payee }),
            this.translate.instant('invoice_list.dismiss_msg'),
            {
                duration: 7000
            }
        );
    }

}