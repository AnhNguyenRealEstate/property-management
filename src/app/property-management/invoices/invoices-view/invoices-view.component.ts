import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { InvoicesViewService } from './invoices-view.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { TranslateService } from '@ngx-translate/core';
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

    @ViewChild('paymentDateTpl') paymentDateTpl!: TemplateRef<string>;
    @ViewChild('beginDateTpl') beginDateTpl!: TemplateRef<string>;

    tableConfig: Config = {
        ...DefaultConfig,
        tableLayout: {
            style: 'normal',
            theme: 'light',
            borderless: false,
            hover: false,
            striped: false
        },
        rows: 1000,
        paginationEnabled: false
    };

    collectedInvoicesCols: Columns[] = [];

    uncollectedInvoicesCols: Columns[] = [];

    constructor(
        private invoicesView: InvoicesViewService,
        private translate: TranslateService
    ) { }

    async ngOnInit() {
        await this.getUnpaidInvoices();
        await this.getPaidInvoices();

        this.collectedInvoicesCols = [
            { key: 'propertyName', title: this.translate.instant('payment_schedule.property_name') },
            { key: 'amount', title: this.translate.instant('payment_schedule.amount'), width: '15%' },
            { key: 'paymentWindow', title: this.translate.instant('payment_schedule.payment_window') },
            { key: 'paymentDate', title: this.translate.instant('payment_schedule.payment_date'), cellTemplate: this.paymentDateTpl, width: '10%' },
            { key: 'description', title: this.translate.instant('payment_schedule.invoice_description'), width: '30%' },
        ];

        this.uncollectedInvoicesCols = [
            { key: 'propertyName', title: this.translate.instant('payment_schedule.property_name') },
            { key: 'payer', title: this.translate.instant('payment_schedule.payer'), width: '15%' },
            { key: 'amount', title: this.translate.instant('payment_schedule.amount') },
            { key: 'beginDate', title: this.translate.instant('payment_schedule.begin_date'), cellTemplate: this.beginDateTpl, width: '10%' },
            { key: 'description', title: this.translate.instant('payment_schedule.invoice_description'), width: '30%' },
        ]
    }

    async getUnpaidInvoices() {
        const invoices = await this.invoicesView.getUnpaidInvoices(this.today);
        this.uncollectedInvoices.lineItems = invoices;
    }

    async getPaidInvoices() {
        const invoices = await this.invoicesView.getPaidInvoices(this.today);
        this.collectedInvoices.lineItems = invoices;
    }
}