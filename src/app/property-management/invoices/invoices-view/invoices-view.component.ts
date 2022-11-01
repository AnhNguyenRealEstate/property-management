import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { InvoicesViewService } from './invoices-view.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Platform } from '@angular/cdk/platform';
import { Invoice } from '../invoices.data';

// https://www.beyondjava.net/angular-material-monthpicker
export class MonthpickerDateAdapter extends NativeDateAdapter {
    constructor(matDateLocale: string, platform: Platform) {
        super(matDateLocale, platform);
    }

    override parse(value: string): Date | null {
        const monthAndYearRegex = /(10|11|12|0\d|\d)\/[\d]{4}/;
        if (value?.match(monthAndYearRegex)) {
            const parts = value.split('/');
            const month = Number(parts[0]);
            const year = Number(parts[1]);
            if (month > 0 && month <= 12) {
                return new Date(year, month - 1);
            }
        }
        return null;
    }

    override format(date: Date, displayFormat: any): string {
        const month = date.getMonth() + 1;
        const monthAsString = ('0' + month).slice(-2);
        const year = date.getFullYear();
        return monthAsString + '/' + year;
    }
}
@Component({
    selector: 'invoices-view',
    templateUrl: 'invoices-view.component.html',
    styleUrls: ['./invoices-view.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useClass: MonthpickerDateAdapter,
            deps: [MAT_DATE_LOCALE, Platform]
        },
    ],
    animations: [
        trigger('scheduleAnim',
            [
                transition('* => *', // whenever binding value changes
                    query(':enter',
                        [
                            style({ opacity: 0, transform: 'translateY(10px)' }),
                            stagger(50, [
                                animate('0.1s', style({ opacity: 1, transform: 'translateY(0)' }))
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
    paidInvoicesDate = new Date();
    paidOutInvoicesDate = new Date();

    uncollectedInvoices: Invoice[] = [];
    collectedInvoices: Invoice[] = [];
    paidOutInvoices: Invoice[] = [];

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
        await this.getUnpaidInvoices('currentMonth');
        await this.getPaidInvoices();
        await this.getPaidOutInvoices();

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

    async getUnpaidInvoices(option?: 'all' | 'currentMonth') {
        this.uncollectedInvoices = await this.invoicesView.getUnpaidInvoices(
            option === 'currentMonth' ? new Date() : undefined
        );
    }

    async getPaidInvoices() {
        this.collectedInvoices = await this.invoicesView.getPaidInvoices(this.paidInvoicesDate);
    }

    async getPaidOutInvoices() {
        this.paidOutInvoices = await this.invoicesView.getPaidOutInvoices(this.paidOutInvoicesDate);
    }

    async getPaidInvoicesFromCalendar(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
        datepicker.close();
        this.paidInvoicesDate = normalizedMonthAndYear;
        this.collectedInvoices = await this.invoicesView.getPaidInvoices(normalizedMonthAndYear);
    }

    async getPaidOutInvoicesFromCalendar(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
        datepicker.close();
        this.paidOutInvoicesDate = normalizedMonthAndYear;
        this.paidOutInvoices = await this.invoicesView.getPaidOutInvoices(normalizedMonthAndYear);
    }

    onPaymentReceived(invoice: Invoice) {
        this.collectedInvoices.unshift(invoice);

        const index = this.uncollectedInvoices.findIndex(inv => inv.id === invoice.id);
        this.uncollectedInvoices.splice(index, 1);
    }

    onPaidOut(invoice: Invoice) {
        this.paidOutInvoices.unshift(invoice);

        const index = this.collectedInvoices.findIndex(inv => inv.id === invoice.id);
        this.collectedInvoices.splice(index, 1);
    }
}

