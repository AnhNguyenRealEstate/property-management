import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { environment } from 'src/environments/environment';
import { Activity } from '../../activities/activity.data';
import { Owner } from '../../owners/owner.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from '../property.data';
import { ContractType, ContractData } from './property-upload.data';
import { PropertyUploadService } from './property-upload.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'property-upload',
    templateUrl: './property-upload.component.html'
})

export class PropertyUploadComponent implements OnInit, OnDestroy {
    linearStepper: boolean = false;

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
    contractType: ContractType = ContractType.rental;

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
        private userProfile: UserProfileService,
        @Optional() private dialogRef: MatDialogRef<PropertyUploadComponent>
    ) {

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
        this.uploadedFiles.push(this.contract);

        this.property.documents!.unshift({
            displayName: this.contract.name,
            dbHashedName: this.hash.generate16DigitHash(this.contract.name)
        } as UploadedFile)

        const data = new FormData();
        data.append('contract_type', this.contractType);
        data.append('contract', this.contract);
        this.contractData = await this.upload.extractContractData(data);
        if (this.contractData) {
            console.log('contractData', this.contractData);
            this.bindExtractionResult(this.contractData);
            this.stepper.next();
        }
    }

    bindExtractionResult(contractData: ContractData) {

        this.secondFormGroup.get('propertyName')?.setValue(contractData.PROPERTY_NAME);
        this.secondFormGroup.get('ownerName')?.setValue(contractData.LANDLORD_NAME);
        this.secondFormGroup.get('tenantName')?.setValue(contractData.TENANT_NAME);
        this.secondFormGroup.get('propertyAddress')?.setValue(contractData.PROPERTY_ADDR);
        this.secondFormGroup.get('propertyCategory')?.setValue(contractData.PROPERTY_CATEGORY);

        const startDateResult = contractData.START_DATE?.match(/[0-9]+/gm);
        if (startDateResult && startDateResult.length >= 3) {
            const year = Number(startDateResult[2]);
            const month = Number(startDateResult[1]) - 1;
            const date = Number(startDateResult[0]);

            if (!isNaN(year) && !isNaN(month) && !isNaN(date)) {
                const startDate = new Date(year, month, date);
                if (!isNaN(startDate.getTime())) {
                    this.secondFormGroup.get('startDate')?.setValue(startDate);
                }
            }
        }

        const endDateResult = contractData.END_DATE?.match(/[0-9]+/gm);
        if (endDateResult && endDateResult?.length >= 3) {
            const year = Number(endDateResult[2]);
            const month = Number(endDateResult[1]) - 1;
            const date = Number(endDateResult[0]);

            if (!isNaN(year) && !isNaN(month) && !isNaN(date)) {
                const endDate = new Date(year, month, date);
                if (!isNaN(endDate.getTime())) {
                    this.secondFormGroup.get('endDate')?.setValue(endDate);
                }
            }
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
        if (!date) {
            return new Timestamp(0, 0);
        }
        return Timestamp.fromDate(date);
    }

    async submit(submitBtn: MatButton) {
        this.property.description = this.propertyDescription;
        this.propertyPreview = this.property as Object;

        this.stepsCanBeEdited = false;
        submitBtn.disabled = true;

        await this.upload.uploadProperty(this.property, this.uploadedFiles, this.schedules);
        await this.upload.addActivity(this.property,
            {
                propertyId: this.property.id,
                propertyName: this.property.name,
                date: Timestamp.now(),
                type: 'newContract',
                description: `Hợp đồng thuê mới. Bên thuê: ${this.property.tenantName}`,
                documents: this.property.documents,
                createdBy: this.userProfile.profile$$.getValue()
            } as Activity
        )

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
