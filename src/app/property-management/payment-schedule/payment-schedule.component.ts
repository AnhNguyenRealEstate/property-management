import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Invoice } from '../invoices/invoices.data';
import { Property } from '../properties/property-card/property-card.data';
import { PaymentSchedule } from './payment-schedule.data';
import { DatePipe } from '@angular/common';
import { PaymentScheduleService } from './payment-schedule.service';

@Component({
    selector: 'payment-schedule',
    templateUrl: './payment-schedule.component.html',
    styleUrls: ['./payment-schedule.component.scss']
})

export class PaymentScheduleComponent implements OnInit {
    @Input() property: Property | undefined;
    @Input() schedule!: PaymentSchedule;
    @Input() edit!: boolean;
    @Input() columnHeaders!: (keyof Invoice)[];
    @Input() canChangeStatus: boolean = false;
    @Input() scheduleName: string = '';

    @Output() scheduleChange: EventEmitter<PaymentSchedule> = new EventEmitter();

    headerCellClass: string = '';
    lineItemCellClass: string = '';

    @ViewChild('scheduleRef') scheduleRef!: ElementRef;

    constructor(
        private datePipe: DatePipe,
        private paymentSchedule: PaymentScheduleService
    ) {
    }

    ngOnInit() {
        if (this.columnHeaders?.length) {
            const bootstrapMaxColWidth = 12;
            const colWidth = Math.floor(bootstrapMaxColWidth / this.columnHeaders.length) || 1;
            this.headerCellClass = `col-${colWidth} d-flex justify-content-center text-bold`;
            this.lineItemCellClass = `col-${colWidth} d-flex justify-content-center`;
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
                payer: this.property?.tenantName,
                payee: this.property?.owner?.contactName,
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

        let currentDate = scheduleBegin;
        let paymentCount = 1;
        while (currentDate.getTime() < scheduleEnd.getTime()) {
            const beginDate: Date = currentDate;
            const dueDate: Date = calculateDueDate(beginDate);

            const lineItem = {
                ...createLineItem(),
                ... {
                    beginDate: Timestamp.fromDate(beginDate),
                    dueDate: Timestamp.fromDate(dueDate),
                    paymentWindow: generatePaymentWindowString(beginDate, dueDate),
                    description: `Lần ${paymentCount}. Từ ${this.datePipe.transform(beginDate, 'dd/MM/yyyy')}, trong vòng ${within} ngày`
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
                        description: `Lần ${paymentCount}. Từ ${this.datePipe.transform(beginDate, 'dd/MM/yyyy')}, trong vòng ${within} ngày`
                    }
                } as Invoice

                lineItems.push(finalLineItem);
                break;
            }
        }

        this.schedule.lineItems = lineItems;
        this.schedule.beginDate = Timestamp.fromDate(scheduleBegin);
        this.schedule.endDate = Timestamp.fromDate(scheduleEnd);
        this.schedule.isActive = true;

        this.scheduleChange.emit(this.schedule);
    }

    removeSchedule() {
        this.schedule = {} as PaymentSchedule;
        this.scheduleChange.emit(this.schedule);
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
}