import { Component, Inject, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { DocumentSnapshot, Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolesService } from 'src/app/shared/roles.service';
import { Activity } from '../../activities/activity.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from "../property.data";
import { PropertyDetailsService } from './property-details.service';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { TranslateService } from '@ngx-translate/core';
import { Invoice } from '../../invoices/invoices.data';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HashingService } from 'src/app/shared/hashing.service';

@Component({
    selector: 'property-details',
    templateUrl: 'property-details.component.html',
    styleUrls: ['./property-details.component.scss']
})

export class PropertyDetailsComponent implements OnInit {
    property!: Property;
    propertyDocuments: UploadedFile[] | undefined;

    activities: Activity[] = [];
    lastActivity!: DocumentSnapshot;
    showViewMoreActivities: boolean = false;
    activityUploadRef!: MatDialogRef<any>;

    schedules: PaymentSchedule[] = [];
    newSchedules: PaymentSchedule[] = [{}];
    scheduleUploadRef!: MatDialogRef<any>;

    newFiles: File[] = [];
    uploadedFiles: UploadedFile[] = [];
    fileUploadRef!: MatDialogRef<any>;

    loading: boolean = true;

    @ViewChild('docPreviewTpl') docPreviewTpl!: TemplateRef<string>;

    @ViewChild('activityUploadTpl') activityUploadTpl!: TemplateRef<string>;
    @ViewChild('scheduleUploadTpl') scheduleUploadTpl!: TemplateRef<string>;
    @ViewChild('filesUploadTpl') filesUploadTpl!: TemplateRef<string>;

    @ViewChild('descriptionTpl') descriptionTpl!: TemplateRef<string>;
    @ViewChild('payerTpl') payerTpl!: TemplateRef<string>;
    @ViewChild('amountTpl') amountTpl!: TemplateRef<string>;
    @ViewChild('periodTpl') periodTpl!: TemplateRef<string>;
    @ViewChild('statusTpl') statusTpl!: TemplateRef<string>;
    @ViewChild('actionsTpl') actionsTpl!: TemplateRef<string>;

    paymentScheduleConfig: Config = {
        ...DefaultConfig,
        tableLayout: {
            style: 'normal',
            theme: 'light',
            borderless: false,
            hover: false,
            striped: true
        },
        rows: 5
    };
    paymentScheduleCols: Columns[] = [];

    invoicesBeingEdited: string[] = []

    constructor(
        private propertyDetails: PropertyDetailsService,
        private translate: TranslateService,
        public roles: RolesService,
        private snackbar: MatSnackBar,
        private datePipe: DatePipe,
        private dialog: MatDialog,
        private hash: HashingService,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.property = this.data.property;
    }

    async ngOnInit() {
        await this.getActivities();
        await this.getPaymentSchedules();
        this.loading = false;

        this.paymentScheduleCols = [
            { key: 'description', title: this.translate.instant('payment_schedule.invoice_description'), cellTemplate: this.descriptionTpl },
            { key: 'payer', title: this.translate.instant('payment_schedule.payer'), cellTemplate: this.payerTpl },
            { key: 'amount', title: this.translate.instant('payment_schedule.amount'), cellTemplate: this.amountTpl },
            { key: 'paymentWindow', title: this.translate.instant('payment_schedule.payment_window'), cellTemplate: this.periodTpl },
            { key: 'status', title: this.translate.instant('payment_schedule.status'), cellTemplate: this.statusTpl },
            { key: 'action', title: this.translate.instant('payment_schedule.actions'), cellTemplate: this.actionsTpl }
        ];

        this.propertyDocuments = this.property.documents?.sort((a, b) =>
            b.date?.toMillis()! - a.date?.toMillis()!
        )
    }

    async getActivities() {
        const activitiesSnap = await this.propertyDetails.getActivities(this.property);
        this.activities = activitiesSnap.docs.map(doc => doc.data() as Activity);
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMoreActivities = this.activities.length === this.propertyDetails.initialNumOfActivities;
    }

    async getMoreActivities() {
        const activitiesSnap = await this.propertyDetails.getMoreActivities(this.property, this.lastActivity);
        this.activities.push(...activitiesSnap.docs.map(doc => doc.data() as Activity));
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMoreActivities = activitiesSnap.size === this.propertyDetails.initialNumOfActivities;
    }

    async getPaymentSchedules() {
        if (this.schedules.length) {
            return;
        }

        if (!this.property.paymentScheduleIds) {
            return;
        }

        this.schedules = await this.propertyDetails.getPaymentSchedules(this.property.paymentScheduleIds);
    }

    getMorePaymentSchedules() {
        throw new Error("Not implemented")
    }

    async downloadDoc(doc: UploadedFile) {
        const blob = await this.propertyDetails.downloadDoc(`${this.property.fileStoragePath}/${doc.dbHashedName}`);
        const file = new File([blob], doc.displayName!);
        const url = window.URL.createObjectURL(file);

        const fileLink = document.createElement('a');
        fileLink.href = url;
        fileLink.download = doc.displayName!;
        fileLink.click();
    }

    timestampToDate(stamp: any): Date {
        return new Date((stamp as any).seconds * 1000);
    }

    async updateInvoice(invoice: Invoice) {
        const DATE_PIPE_FORMAT = 'dd/MM/yyyy';
        invoice.paymentWindow = `${this.datePipe.transform(invoice.beginDate!.toDate(), DATE_PIPE_FORMAT)} - ${this.datePipe.transform(invoice.dueDate!.toDate(), DATE_PIPE_FORMAT)}`;
        await this.propertyDetails.updateInvoice(invoice);

        const index = this.invoicesBeingEdited.findIndex(invoiceId => invoiceId === invoice.id);
        this.invoicesBeingEdited.splice(index, 1);

        this.snackbar.open(
            this.translate.instant('property_details.invoice_edit_success'),
            this.translate.instant('property_details.dismiss_msg'),
            {
                duration: 3000
            }
        )
    }

    cancelUpdate(invoice: Invoice) {
        const index = this.invoicesBeingEdited.findIndex(invoiceId => invoiceId === invoice.id);
        this.invoicesBeingEdited.splice(index, 1);
    }

    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    }

    changeInvoiceBeginDate(invoice: Invoice, input: HTMLInputElement) {
        const value = input.value;
        const numbers = value.split('/').map(val => Number(val));
        if (numbers.length === 3) {
            const newDate = new Date(numbers[2], numbers[1] - 1, numbers[0]);
            invoice.beginDate = Timestamp.fromDate(newDate);
        }
    }

    changeInvoiceDueDate(invoice: Invoice, input: HTMLInputElement) {
        const value = input.value;
        const numbers = value.split('/').map(val => Number(val));
        if (numbers.length === 3) {
            const newDate = new Date(numbers[2], numbers[1] - 1, numbers[0]);
            invoice.dueDate = Timestamp.fromDate(newDate);
        }
    }

    openActivityUpload() {
        this.activityUploadRef = this.dialog.open(this.activityUploadTpl);
    }

    async addActivity(activityAddedEvent: any) {
        const activity: Activity = activityAddedEvent.activity;
        const newFiles: File[] = activityAddedEvent.newFiles;

        activity.propertyName = this.property.name;
        activity.propertyId = this.property.id;

        await this.propertyDetails.addActivity(this.property, activity, newFiles);

        this.snackbar.open(
            this.translate.instant('property_card.activity_added'),
            this.translate.instant('property_card.dismiss_msg'),
            {
                duration: 3000
            }
        )

        await this.getActivities();
        this.activityUploadRef.close();
    }

    openScheduleUpload() {
        this.scheduleUploadRef = this.dialog.open(this.scheduleUploadTpl, {
            height: '70vh'
        });
    }

    addSchedule() {
        this.newSchedules.push({} as PaymentSchedule);
    }

    async uploadSchedules() {
        this.newSchedules = this.newSchedules.filter(schedule => schedule.lineItems?.length);
        const newScheduleIds = await this.propertyDetails.uploadSchedules(this.newSchedules, this.property);
        this.schedules = await this.propertyDetails.getPaymentSchedules(newScheduleIds);

        this.newSchedules = [];
        this.scheduleUploadRef.close();
    }

    uploadedFileDrop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.uploadedFiles!, event.previousIndex, event.currentIndex);
    }

    doesFileNameAlreadyExist(name: string) {
        return !!this.property.documents?.find(doc => doc.displayName === name);
    }

    onFileNameChange(oldDisplayName: string, newDisplayName: string, file: UploadedFile) {
        if (this.uploadedFiles.find(file => file.displayName === newDisplayName)) {
            return;
        }

        const fileToAmend = this.uploadedFiles.find(file => file.displayName === oldDisplayName);
        if (!fileToAmend) {
            return;
        }

        Object.defineProperty(fileToAmend, 'name', {
            writable: true,
            value: newDisplayName
        });

        file.displayName = newDisplayName;
        file.dbHashedName = this.hash.generate16DigitHash(newDisplayName);
    }

    onFileRemove(index: number) {
        const removedFile = this.uploadedFiles.splice(index, 1);

        const indexToRemove = this.newFiles.findIndex(file => file.name === removedFile[0].displayName);
        this.newFiles.splice(indexToRemove, 1);
    }

    onFileUpload(event: any) {
        const files = (event.target.files as FileList);
        if (files.length === 0) {
            return;
        }

        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i)!;

            if (this.property.documents?.length
                && this.property.documents.find(doc => doc.displayName === file.name)) {
                continue;
            }

            newFiles.unshift(file);
        }
        this.newFiles = newFiles;

        const newUploadedFiles = newFiles.map(file => {
            return {
                displayName: file.name,
                dbHashedName: this.hash.generate16DigitHash(file.name)
            } as UploadedFile
        })

        this.uploadedFiles.unshift(...newUploadedFiles);
    }

    openFilesUpload() {
        this.fileUploadRef = this.dialog.open(this.filesUploadTpl, { width: '60vw', height: '70vh' });
    }

    async uploadFiles() {
        await this.propertyDetails.storeFiles(this.newFiles, this.uploadedFiles, this.property);

        this.newFiles = [];
        this.uploadedFiles = [];

        this.fileUploadRef.close();
    }

    async deactivateSchedule(schedule: PaymentSchedule) {
        await this.propertyDetails.deactivateSchedule(schedule);
        this.schedules = [];
        await this.getPaymentSchedules();
    }
}