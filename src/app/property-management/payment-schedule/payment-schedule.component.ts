import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Invoice } from '../invoices/invoices.data';
import { Property } from '../properties/property-card/property-card.data';
import { PaymentSchedule } from './payment-schedule.data';

@Component({
    selector: 'payment-schedule',
    templateUrl: './payment-schedule.component.html'
})

export class PaymentScheduleComponent implements OnInit {
    @Input() property!: Property;
    @Input() schedule!: PaymentSchedule;
    @Input() edit!: boolean;
    @Input() columnHeaders!: (keyof Invoice)[];

    @Output() scheduleChange: EventEmitter<PaymentSchedule> = new EventEmitter();

    headerCellClass: string = '';
    lineItemCellClass: string = '';

    constructor() { }

    ngOnInit() {
        if (this.columnHeaders?.length) {
            const bootstrapMaxColWidth = 12;
            const colWidth = Math.floor(bootstrapMaxColWidth / this.columnHeaders.length) || 1;
            this.headerCellClass = `col-${colWidth} d-flex justify-content-center text-bold`;
            this.lineItemCellClass = `col-${colWidth} d-flex justify-content-center`;
        }
    }

    createPaymentSchedule(amount: string, collectionInterval: number, scheduleBeginInput: HTMLInputElement, scheduleEndInput: HTMLInputElement) {
        const lineItems: Invoice[] = [];

        const scheduleBeginStrings = scheduleBeginInput.value.split('/').map(value => Number(value));
        const scheduleBegin = new Date(scheduleBeginStrings[2], scheduleBeginStrings[1], scheduleBeginStrings[0]);

        const scheduleEndStrings = scheduleEndInput.value.split('/').map(value => Number(value));
        const scheduleEnd = new Date(scheduleEndStrings[2], scheduleEndStrings[1], scheduleEndStrings[0]);

        let currentDate = scheduleBegin;

        while (currentDate.getTime() < scheduleEnd.getTime()) {
            const beginDate: Date = currentDate;

            let dueDateMonth = beginDate.getMonth() + collectionInterval;
            const monthOffsetNeccessary = beginDate.getDate() == 1;
            if (monthOffsetNeccessary) {
                dueDateMonth += 1;
            }
            const dueDate: Date = new Date(beginDate.getFullYear(), dueDateMonth, beginDate.getDate() - 1);

            const lineItem = {
                payer: this.property?.tenantName,
                payee: this.property?.owner?.contactName,
                dateCreated: Timestamp.fromDate(new Date()),
                beginDate: Timestamp.fromDate(beginDate),
                dueDate: Timestamp.fromDate(dueDate),
                paymentWindow: `${beginDate.toDateString()} - ${dueDate.toDateString()}`,
                paymentDate: undefined,
                payoutDate: undefined,
                propertyId: this.property?.id,
                status: 'unpaid',
                amount: amount,
                description: ''
            } as Invoice
            lineItems.push(lineItem);

            currentDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate() + 1);
            if (currentDate.getTime() > scheduleEnd.getTime()) {
                const finalBeginDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                const finalDueDate = scheduleEnd;

                const finalLineItem = {
                    payer: this.property?.tenantName,
                    payee: this.property?.owner?.contactName,
                    dateCreated: Timestamp.fromDate(new Date()),
                    beginDate: Timestamp.fromDate(finalBeginDate),
                    dueDate: Timestamp.fromDate(finalDueDate),
                    paymentWindow: `${finalBeginDate.toDateString()} - ${finalBeginDate.toDateString()}`,
                    paymentDate: undefined,
                    payoutDate: undefined,
                    propertyId: this.property?.id,
                    status: 'unpaid',
                    amount: amount,
                    description: ''
                } as Invoice

                lineItems.push(finalLineItem);
            }
        }

        this.schedule.lineItems = lineItems;
        this.scheduleChange.emit(this.schedule);
    }
}