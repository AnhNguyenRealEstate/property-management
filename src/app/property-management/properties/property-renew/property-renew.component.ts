import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { environment } from 'src/environments/environment';
import { Owner } from '../../owners/owner.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { ContractData, ContractType } from '../property-upload/property-upload.data';
import { Property } from '../property.data';
import { PropertyRenewService } from './property-renew.service';

/**
 * This component is nearly identical to PropertyUploadComponent, except it handles the renewal logic
 * instead of uploading a new property altogether
 */
@Component({
    selector: 'property-renew',
    templateUrl: 'property-renew.component.html'
})

export class PropertyRenewComponent implements OnInit, OnDestroy {
    linearStepper: boolean = false;

    property: Property = {
        owner: {} as Owner,
        documents: []
    } as Property;
    propertyPreview!: Object;

    propertyDescription = '';

    uploadedFiles: UploadedFile[] = [];
    files: File[] = [];

    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;

    contract!: File;
    contractData: ContractData | undefined;
    contractType: ContractType = ContractType.rental;

    sub: Subscription = new Subscription();

    @ViewChild('stepper') stepper!: MatStepper;
    stepsCanBeEdited = true;

    schedules: PaymentSchedule[] = [];

    constructor(
        private formBuilder: FormBuilder,
        public renew: PropertyRenewService,
        private hash: HashingService,
        @Optional() private dialogRef: MatDialogRef<PropertyRenewService>,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {

        if (this.data?.property) {
            this.property = Object.assign({}, this.data.property);
        }

        this.firstFormGroup = this.formBuilder.group({
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

        if (environment.production) {
            this.linearStepper = true;
        }
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
        this.files.push(this.contract);

        this.uploadedFiles.unshift({
            displayName: this.contract.name,
            dbHashedName: this.hash.generate16DigitHash(this.contract.name)
        } as UploadedFile)

        const data = new FormData();
        data.append('contract_type', this.contractType);
        data.append('contract', this.contract);
        this.contractData = await this.renew.extractContractData(data);
        if (this.contractData) {
            this.bindExtractionResult(this.contractData);
            this.stepper.next();
        }
    }

    bindExtractionResult(contractData: ContractData) {
        this.secondFormGroup.get('propertyName')?.setValue(this.property.name);
        this.secondFormGroup.get('propertyCategory')?.setValue(this.property.category);
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

            const endDate = new Date(year, month, date);
            this.secondFormGroup.get('endDate')?.setValue(endDate);
        }

        this.propertyDescription =
            `${contractData.TENANT_NAME ? `<p>Bên thuê hiện tại: ${contractData.TENANT_NAME}</p>` : ''}
            ${contractData.CONTRACT_NUM ? `Số HĐ: ${contractData.CONTRACT_NUM}` : ''}
            ${contractData.PROPERTY_PURPOSE ? `<p>${contractData.PROPERTY_PURPOSE}</p>` : ''}`.trim()

        this.property.owner = {
            contactName: this.secondFormGroup.get('ownerName')?.value
        }
        this.property.tenantName = this.secondFormGroup.get('tenantName')?.value;
        this.property.address = this.secondFormGroup.get('propertyAddress')?.value;
        this.property.description = this.propertyDescription;
    }

    onFileUpload(event: any) {
        const files = (event.target.files as FileList);
        if (files.length === 0) {
            return;
        }

        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i)!;

            if (this.uploadedFiles.length
                && this.uploadedFiles.find(doc => doc.displayName === file.name)) {
                continue;
            }

            newFiles.unshift(file);
            this.files.unshift(file);
        }

        this.uploadedFiles.unshift(...newFiles.map(file => {
            return {
                displayName: file.name,
                dbHashedName: this.hash.generate16DigitHash(file.name)
            } as UploadedFile
        }))

    }

    onFileRemove(index: number) {
        this.uploadedFiles.splice(index, 1);
    }

    onFileNameChange(oldDisplayName: string, newDisplayName: string, file: UploadedFile) {
        if (this.files.find(file => file.name === newDisplayName)) {
            return;
        }

        const fileToAmend = this.files.find(file => file.name === oldDisplayName);
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
        moveItemInArray(this.uploadedFiles, event.previousIndex, event.currentIndex);
    }

    doesFileNameAlreadyExist(name: string) {
        return !!this.uploadedFiles.find(doc => doc.displayName === name);
    }

    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    }

    async submit(submitBtn: MatButton) {
        this.propertyPreview = this.property as Object;

        this.stepsCanBeEdited = false;
        submitBtn.disabled = true;

        await this.renew.renewProperty(this.property, this.files, this.uploadedFiles, this.schedules);

        this.dialogRef.close({
            success: true,
            data: {
                property: this.property
            }
        });
    }

    resetForms() {
        this.firstFormGroup.reset();
        this.secondFormGroup.reset();
    }

    reinitVariables() {
        this.files = [];
        this.uploadedFiles = [];

        this.property = this.data?.property;
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