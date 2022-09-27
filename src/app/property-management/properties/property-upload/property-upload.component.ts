import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { Invoice } from '../../invoices/invoices.data';
import { OwnerUploadComponent } from '../../owners/owner-upload/owner-upload.component';
import { Owner } from '../../owners/owners-view/owner.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from '../property-card/property-card.data';
import { ContractType, ContractData } from './property-upload.data';
import { PropertyUploadService } from './property-upload.service';

@Component({
    selector: 'property-upload',
    templateUrl: './property-upload.component.html'
})

export class PropertyUploadComponent implements OnInit, OnDestroy {
    property: Property = {
        owner: {} as Owner,
        documents: []
    } as Property;
    propertyPreview!: Object;

    propertyDescription = '';
    uploadedFiles: File[] = [];

    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;

    contract!: File;
    contractData: ContractData | undefined;

    sub: Subscription = new Subscription();

    @ViewChild('stepper') stepper!: MatStepper;
    stepsCanBeEdited = true;

    schedules: PaymentSchedule[] = [];

    constructor(
        private formBuilder: FormBuilder,
        public upload: PropertyUploadService,
        private hash: HashingService,
        private snackbar: MatSnackBar,
        private translate: TranslateService,
        @Optional() private dialogRef: MatDialogRef<OwnerUploadComponent>
    ) {
        this.firstFormGroup = this.formBuilder.group({
            contractType: new FormControl(ContractType.rental),
            contract: new FormControl<File | undefined>(undefined)
        });

        this.secondFormGroup = this.formBuilder.group({
            ownerName: new FormControl(''),
            tenantName: new FormControl(''),
            propertyName: new FormControl(''),
            propertyAddress: new FormControl(''),
            propertyCategory: new FormControl(''),
            propertySubcategory: new FormControl(''),
            startDate: new FormControl<Date | undefined>(undefined),
            endDate: new FormControl<Date | undefined>(undefined)
        });
    }

    ngOnInit() {
        this.sub.add(this.dialogRef.afterClosed().subscribe(() => {
            this.resetForms();
            this.reinitVariables();
        }));
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    async onContractUpload(event: any) {
        this.secondFormGroup.reset();
        this.reinitVariables();

        const files = event.target.files as FileList;
        this.contract = files[0];
        this.uploadedFiles.push(this.contract);

        this.property.documents!.unshift({
            displayName: this.contract.name,
            dbHashedName: this.hash.generate16DigitHash(this.contract.name)
        } as UploadedFile)

        const data = new FormData();
        data.append('contract_type', this.firstFormGroup.controls['contractType'].value as string);
        data.append('contract', this.contract);
        this.contractData = await this.upload.extractContractData(data);
        if (this.contractData) {
            this.bindExtractionResult(this.contractData);
            this.stepper.next();
        }
    }

    bindExtractionResult(contractData: ContractData) {
        this.secondFormGroup.get('propertyName')?.setValue(contractData.PROPERTY_NAME);
        this.secondFormGroup.get('ownerName')?.setValue(contractData.LANDLORD_NAME);
        this.secondFormGroup.get('tenantName')?.setValue(contractData.TENANT_NAME);
        this.secondFormGroup.get('propertyAddress')?.setValue(contractData.PROPERTY_ADDR);

        const startDateResult = contractData.START_DATE?.match(/[0-9]+/gm);
        if (startDateResult && startDateResult.length >= 3) {
            const year = Number(startDateResult[2]);
            const month = Number(startDateResult[1]) - 1;
            const date = Number(startDateResult[0]);

            const startDate = new Date(year, month, date);
            this.secondFormGroup.get('startDate')?.setValue(startDate);
        }

        const endDateResult = contractData.END_DATE?.match(/[0-9]+/gm);
        if (endDateResult && endDateResult?.length >= 3) {
            const year = Number(endDateResult[2]);
            const month = Number(endDateResult[1]) - 1;
            const date = Number(endDateResult[0]);

            const startDate = new Date(year, month, date);
            this.secondFormGroup.get('endDate')?.setValue(startDate);
        }

        this.propertyDescription =
            `${contractData.TENANT_NAME ? `<p>Bên thuê hiện tại: ${contractData.TENANT_NAME}</p>` : ''}
            ${contractData.CONTRACT_NUM ? `Số HĐ: ${contractData.CONTRACT_NUM}` : ''}
            ${contractData.PROPERTY_PURPOSE ? `<p>${contractData.PROPERTY_PURPOSE}</p>` : ''}`.trim()
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
            this.uploadedFiles.unshift(file);
        }

        if (!this.property.documents?.length) {
            this.property.documents = [];
        }

        this.property.documents.unshift(...newFiles.map(file => {
            return {
                displayName: file.name,
                dbHashedName: this.hash.generate16DigitHash(file.name)
            } as UploadedFile
        }))

    }

    onFileRemove(index: number) {
        this.property.documents!.splice(index, 1);
    }

    onFileNameChange(oldDisplayName: string, newDisplayName: string, file: UploadedFile) {
        if (this.uploadedFiles.find(file => file.name === newDisplayName)) {
            return;
        }

        const fileToAmend = this.uploadedFiles.find(file => file.name === oldDisplayName);
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

    uploadedFileDrop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.property.documents!, event.previousIndex, event.currentIndex);
    }

    doesFileNameAlreadyExist(name: string) {
        return !!this.property.documents?.find(doc => doc.displayName === name);
    }

    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    }

    async submit(submitBtn: MatButton) {
        this.property.description = this.propertyDescription;
        this.propertyPreview = this.property as Object;

        this.stepsCanBeEdited = false;
        submitBtn.disabled = true;

        const invoices: Invoice[] = [];
        for (let i = 0; i < this.schedules.length; i++) {
            if (this.schedules[i].lineItems?.length) {
                invoices.push(...this.schedules[i].lineItems!);
            }
        }

        await this.upload.uploadProperty(this.property, this.uploadedFiles, this.schedules);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('property_upload.upload_successful')),
            undefined,
            { duration: 1500 }
        );

        this.dialogRef.close({
            success: true,
            data: this.property
        });
    }

    resetForms() {
        this.firstFormGroup.reset();
        this.secondFormGroup.reset();
    }

    reinitVariables() {
        this.uploadedFiles = [];

        this.property = {
            documents: [],
            description: '',
            owner: {} as Owner
        } as Property;
        this.propertyPreview = {};

        this.propertyDescription = '';

        this.schedules = [];
    }

    addSchedule() {
        this.schedules.push({} as PaymentSchedule)
    }

    removeEmptySchedules() {
        this.schedules = this.schedules.filter(schedule => schedule.lineItems?.length);
    }
}