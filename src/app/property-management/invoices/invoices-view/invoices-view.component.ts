import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { Invoice } from '../invoices.data';
import { InvoicesViewService } from './invoices-view.service';

@Component({
    selector: 'invoices-view',
    templateUrl: 'invoices-view.component.html',
    animations: [
        trigger('scheduleAnim',
            [
                transition('* => *', // whenever binding value changes
                    query(':enter',
                        [
                            style({ opacity: 0, transform: 'translateY(40px)' }),
                            stagger(100, [
                                animate('0.2s', style({ opacity: 1, transform: 'translateY(0)' }))
                            ])
                        ],
                        { optional: true }
                    )
                )
            ]
        )
    ]
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