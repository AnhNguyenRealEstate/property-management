import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { environment } from 'src/environments/environment';
import { Invoice } from '../../invoices/invoices.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { ContractData, ContractType } from '../property-upload/property-upload.data';
import { Property } from '../property.data';
import { ExtensionData } from './contract-extension.data';
import { ContractExtensionService } from './contract-extension.service';

@Component({
    selector: 'contract-extension',
    templateUrl: 'contract-extension.component.html'
})

export class ContractExtensionComponent implements OnInit {
    extensionData: ExtensionData = {}
    property: Property = {}

    uploadContractFormGroup: FormGroup
    contractInfoFormGroup: FormGroup

    contract: File | undefined
    contractData: ContractData | undefined
    contractType: ContractType = ContractType.rental_extension

    files: File[] = []
    uploadedFiles: UploadedFile[] = []

    @ViewChild('stepper') stepper!: MatStepper

    sub: Subscription = new Subscription()

    schedules: PaymentSchedule[] = []

    linear: boolean = true

    stepsCanBeEdited: boolean = true;

    constructor(
        public contractExtension: ContractExtensionService,
        private formBuilder: FormBuilder,
        private hash: HashingService,
        private snackbar: MatSnackBar,
        @Optional() private dialogRef: MatDialogRef<ContractExtensionComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.uploadContractFormGroup = this.formBuilder.group({
            contract: new FormControl<File | undefined>(undefined)
        })

        this.contractInfoFormGroup = this.formBuilder.group({
            ownerName: new FormControl(''),
            tenantName: new FormControl(''),
            startDate: new FormControl<Date | undefined>(undefined),
            endDate: new FormControl<Date | undefined>(undefined)
        })

        if (this.data?.property) {
            this.property = this.data.property as Property;
            this.extensionData.propertyId = this.property.id;
        }

        this.linear = environment.production;
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
        this.contractInfoFormGroup.reset()
        this.reinitVariables()

        const files = event.target.files as FileList
        this.contract = files[0]
        this.files.push(this.contract)

        this.uploadedFiles!.unshift({
            displayName: this.contract.name,
            dbHashedName: this.hash.generate16DigitHash(this.contract.name)
        } as UploadedFile)

        const data = new FormData()
        data.append('contract_type', this.contractType)
        data.append('contract', this.contract)
        this.contractData = await this.contractExtension.extractContractData(data)
        if (this.contractData) {
            this.bindExtractionResult(this.contractData)
            this.stepper.next()
        }
    }

    bindExtractionResult(contractData: ContractData) {
        this.contractInfoFormGroup.get('ownerName')?.setValue(contractData.LANDLORD_NAME)
        this.contractInfoFormGroup.get('tenantName')?.setValue(contractData.TENANT_NAME)

        const startDateResult = contractData.START_DATE?.match(/[0-9]+/gm)
        if (startDateResult && startDateResult.length >= 3) {
            const year = Number(startDateResult[2])
            const month = Number(startDateResult[1]) - 1
            const date = Number(startDateResult[0])

            const startDate = new Date(year, month, date)
            this.contractInfoFormGroup.get('startDate')?.setValue(startDate)
        }

        const endDateResult = contractData.END_DATE?.match(/[0-9]+/gm)
        if (endDateResult && endDateResult?.length >= 3) {
            const year = Number(endDateResult[2])
            const month = Number(endDateResult[1]) - 1
            const date = Number(endDateResult[0])

            const endDate = new Date(year, month, date)
            this.contractInfoFormGroup.get('endDate')?.setValue(endDate)
        }
    }

    resetForms() {
        this.contractInfoFormGroup.reset()
        this.uploadContractFormGroup.reset()
    }

    reinitVariables() {
        this.files = []
        this.uploadedFiles = []

        this.contract = undefined
        this.contractData = undefined
    }

    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date)
    }

    addSchedule() {
        this.schedules.push({} as PaymentSchedule)
    }

    removeEmptySchedules() {
        this.schedules = this.schedules.filter(schedule => schedule.lineItems?.length)
    }

    async submit(submitBtn: MatButton) {
        this.stepsCanBeEdited = false
        submitBtn.disabled = true

        if (!this.property.documents?.length) {
            this.property.documents = []
        }
        this.property.documents!.push(...this.uploadedFiles)
        await this.contractExtension.extendContract(this.property, this.extensionData, this.files, this.schedules)

        this.snackbar.open(
            'Successfully extended contract',
            undefined,
            { duration: 1500 }
        )

        this.dialogRef.close({
            success: true,
            data: this.property
        });
    }
}