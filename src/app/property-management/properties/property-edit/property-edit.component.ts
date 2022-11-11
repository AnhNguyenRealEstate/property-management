import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { DocumentSnapshot, Timestamp } from '@angular/fire/firestore';
import { Form, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { Activity } from '../../activities/activity.data';
import { Owner } from '../../owners/owner.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from "../property.data";
import { PropertyUploadService } from './property-edit.service';

@Component({
    selector: 'property-upload',
    templateUrl: 'property-edit.component.html',
    styleUrls: ['./property-edit.component.scss']
})

export class PropertyEditComponent implements OnInit {
    property: Property = {} as Property;
    isEditMode: boolean = false;

    uploadedFiles: File[] = [];
    deletedFiles: UploadedFile[] = [];

    showViewMore: boolean = false;

    managementStartDate!: Date | undefined;
    managementEndDate!: Date | undefined;

    ownerAlreadyExists = true;

    constructor(
        private translate: TranslateService,
        private snackbar: MatSnackBar,
        public propertyUpload: PropertyUploadService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        @Optional() private dialogRef: MatDialogRef<PropertyEditComponent>
    ) {
        this.property = this.data.property as Property;
        this.isEditMode = this.data.isEditMode;

        if (!this.isEditMode) {
            this.property.owner = {} as Owner;
        }
    }

    async ngOnInit() {
        this.managementStartDate = this.property.managementStartDate?.toDate();
        this.managementEndDate = this.property.managementEndDate?.toDate();
    }

    async edit() {
        await this.propertyUpload.editProperty(this.property);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('property_upload.edit_successful')),
            undefined,
            { duration: 1500 }
        );

        this.dialogRef.close({
            success: true
        });
    }

    dateToTimestamp(date: Date): Timestamp {
        return Timestamp.fromDate(date);
    }

    async checkIfOwnerAlreadyExists(username: string) {
        if (!username) {
            return new Promise(_ => false);
        }

        const ownerInfo = await this.propertyUpload.getOwnerInformation(username);
        this.ownerAlreadyExists = !!ownerInfo.username;

        if (this.ownerAlreadyExists) {
            this.property.owner = ownerInfo;
        }
    }
}