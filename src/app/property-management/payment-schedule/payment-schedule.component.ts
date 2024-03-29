import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Invoice } from '../invoices/invoices.data';
import { Property } from '../properties/property.data';
import { PaymentSchedule } from './payment-schedule.data';
import { DatePipe } from '@angular/common';
import { PaymentScheduleService } from './payment-schedule.service';

export interface DefaultInputValues {
    startDate?: Date,
    endDate?: Date
}
@Component({
    selector: 'payment-schedule',
    templateUrl: './payment-schedule.component.html',
    styleUrls: ['./payment-schedule.component.scss']
})

export class PaymentScheduleComponent implements OnInit {
    @Input() property: Property | undefined;
    @Input() schedule!: PaymentSchedule;
    @Input() editable!: boolean;
    @Input() columnHeaders!: (keyof Invoice)[];
    @Input() canChangeStatus: boolean = false;
    @Input() scheduleName: string = '';
    @Input() defaultValues: DefaultInputValues | undefined;

    scheduleDescription: string = '';
    selectedPayer: string = '';
    payer: string = '';
    customPayer: string = '';

    selectedPayee: string = '';
    payee: string = '';
    customPayee: string = '';

    companyName: string = 'BĐS Anh Nguyễn';

    headerCellClass: string = '';
    lineItemCellClass: string = '';

    @ViewChild('scheduleRef') scheduleRef!: ElementRef;

    constructor(
        private datePipe: DatePipe,
        private paymentSchedule: PaymentScheduleService
    ) {
    }

    ngOnInit() {
        this.customPayer = this.property?.tenantName || '';
        this.payer = this.property?.tenantName || '';
        this.selectedPayer = this.payer = this.property?.tenantName || '';

        this.customPayee = this.property?.owner?.contactName || '';
        this.payee = this.property?.owner?.contactName || '';
        this.selectedPayee = this.property?.owner?.contactName || '';

        if (this.columnHeaders?.length) {
            const bootstrapMaxColWidth = 12;
            const colWidth = Math.floor(bootstrapMaxColWidth / this.columnHeaders.length) || 1;
            this.headerCellClass = `col-${colWidth} d-flex justify-content-center text-bold`;
            this.lineItemCellClass = `col-${colWidth} d-flex justify-content-center`;
        }

        const setDefaultName = this.schedule.beginDate && this.schedule.endDate && !this.scheduleName;
        if (setDefaultName) {
            this.scheduleName = `Lịch thanh toán cho giai đoạn
            ${this.datePipe.transform(this.schedule.beginDate?.toDate(), 'dd/MM/yyyy')}
            - ${this.datePipe.transform(this.schedule.endDate?.toDate(), 'dd/MM/yyyy')}`;
        }
    }

    createPaymentSchedule(amount: string, collectionInterval: number, within: number, scheduleBeginInput: HTMLInputElement, scheduleEndInput: HTMLInputElement) {
        const getDateFromInput = (input: HTMLInputElement) => {
            const dateNums = input.value.split('/').map(value => Number(value));
            const monthOffset = 1;
            return new Date(dateNums[2], dateNums[1] - monthOffset, dateNums[0]);
        }

        const generatePaymentWindowString = (beginDate: Date, dueDate: Date) => {
            const DATE_PIPE_FORMAT = 'dd/MM/yyyy';
            return `${this.datePipe.transform(beginDate.toDateString(), DATE_PIPE_FORMAT)} - ${this.datePipe.transform(dueDate.toDateString(), DATE_PIPE_FORMAT)}`;
        }

        const createLineItem = () => {
            return {
                payer: String(this.customPayer || this.selectedPayer || this.payer),
                payee: String(this.customPayee || this.selectedPayee || this.payee),
                dateCreated: Timestamp.fromDate(new Date()),
                paymentDate: undefined,
                payoutDate: undefined,
                propertyId: this.property?.id,
                propertyName: this.property?.name,
                status: 'unpaid',
                amount: amount,
                description: '',
                payWithin: within,
                scheduleId: this.schedule.id
            } as Invoice
        }

        const calculateDueDate = (beginDate: Date) => {
            let dueDateMonth = beginDate.getMonth() + collectionInterval;
            const dueDate: Date = new Date(beginDate.getFullYear(), dueDateMonth, beginDate.getDate() - 1);
            return dueDate;
        }

        const lineItems: Invoice[] = [];

        const scheduleBegin = getDateFromInput(scheduleBeginInput);
        const scheduleEnd = getDateFromInput(scheduleEndInput);

        this.scheduleName = `Lịch thanh toán cho giai đoạn ${this.datePipe.transform(scheduleBegin, 'dd/MM/yyyy')} - ${this.datePipe.transform(scheduleEnd, 'dd/MM/yyyy')}`;

        let currentDate = scheduleBegin;
        let paymentCount = 1;

        if (!currentDate || !scheduleEnd) {
            return
        }

        while (currentDate.getTime() < scheduleEnd.getTime()) {
            const beginDate: Date = currentDate;
            const dueDate: Date = calculateDueDate(beginDate);

            const lineItem = {
                ...createLineItem(),
                ... {
                    beginDate: Timestamp.fromDate(beginDate),
                    dueDate: Timestamp.fromDate(dueDate),
                    paymentWindow: generatePaymentWindowString(beginDate, dueDate),
                    description: `Lần ${paymentCount}.
                    Từ ${this.datePipe.transform(beginDate, 'dd/MM/yyyy')}, trong vòng ${within} ngày
                    ${this.scheduleDescription.trim().length ? `(${this.scheduleDescription.trim()})` : ''}`
                }
            } as Invoice
            lineItems.push(lineItem);

            currentDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);
            paymentCount++;

            const nextDueDate: Date = calculateDueDate(currentDate);
            const oddMonthsRemaining = (currentDate.getTime() < scheduleEnd.getTime()) && (nextDueDate.getTime() > scheduleEnd.getTime());
            if (oddMonthsRemaining) {
                const finalBeginDate = new Date(currentDate);
                const finalDueDate = scheduleEnd;
                const finalLineItem = {
                    ...createLineItem(),
                    ...{
                        beginDate: Timestamp.fromDate(finalBeginDate),
                        dueDate: Timestamp.fromDate(finalDueDate),
                        paymentWindow: generatePaymentWindowString(finalBeginDate, finalDueDate),
                        amount: '',
                        description: `Lần ${paymentCount}. Từ ${this.datePipe.transform(beginDate, 'dd/MM/yyyy')}, trong vòng ${within} ngày ${this.scheduleDescription.trim().length ? `(${this.scheduleDescription.trim()})` : ''}`
                    }
                } as Invoice

                lineItems.push(finalLineItem);
                break;
            }
        }

        this.schedule.lineItems = lineItems;
        this.schedule.beginDate = Timestamp.fromDate(scheduleBegin);
        this.schedule.endDate = Timestamp.fromDate(scheduleEnd);
        this.schedule.description = this.scheduleDescription;
        this.schedule.isActive = true;
    }

    removeSchedule() {
        this.schedule = {} as PaymentSchedule;
    }

    focusFirstEditable() {
        setTimeout(() => {
            const formGroupInvalid = this.scheduleRef.nativeElement.querySelectorAll('input[class*="ng-invalid"]:not([hidden])');
            const el = formGroupInvalid[0] as HTMLElement;
            if (el) {
                el.scrollIntoView({ block: 'center' });
                el.focus();
            }
        })
    }

    async markAsPaid(invoice: Invoice) {
        await this.paymentSchedule.markInvoiceAsPaid(invoice);
        invoice.status = 'paid';
    }

    dateToTimestamp(value: string): Timestamp {
        const dateStrings = value.split('/').map(string => Number(string))
        return Timestamp.fromDate(new Date(dateStrings[2], dateStrings[1] - 1, dateStrings[0]))
    }

    updateInvoicePaymentPeriod(invoice: Invoice, beginDate: string, endDate: string) {
        const beginDateTokens = beginDate.split('/').map(string => Number(string))
        const _beginDate = new Date(beginDateTokens[2], beginDateTokens[1] - 1, beginDateTokens[0])

        const dueDateTokens = endDate.split('/').map(string => Number(string))
        const _dueDate = new Date(dueDateTokens[2], dueDateTokens[1] - 1, dueDateTokens[0])

        invoice.paymentWindow =
            `${this.datePipe.transform(_beginDate, 'dd/MM/yyyy')} - ${this.datePipe.transform(_dueDate, 'dd/MM/yyyy')}`
    }
}