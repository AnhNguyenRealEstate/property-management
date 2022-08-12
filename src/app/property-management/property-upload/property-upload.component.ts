import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { DocumentSnapshot, Timestamp } from '@angular/fire/firestore';
import { Form, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { HashingService } from 'src/app/shared/hashing.service';
import { Activity, Owner, Property, UploadedFile } from '../property-management.data';
import { PropertyUploadService } from './property-upload.service';

@Component({
    selector: 'property-upload',
    templateUrl: 'property-upload.component.html',
    styleUrls: ['./property-upload.component.scss']
})

export class PropertyUploadComponent implements OnInit {
    property: Property = {} as Property;
    isEditMode: boolean = false;

    uploadedFiles: File[] = [];
    deletedFiles: UploadedFile[] = [];

    deletedActivities: Activity[] = [];
    activities: Activity[] = [];
    lastActivity!: DocumentSnapshot;

    showViewMore: boolean = false;

    managementStartDate!: Date | undefined;
    managementEndDate!: Date | undefined;

    ownerAlreadyExists = true;

    constructor(
        private translate: TranslateService,
        private snackbar: MatSnackBar,
        public propertyUpload: PropertyUploadService,
        private hash: HashingService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        @Optional() private dialogRef: MatDialogRef<PropertyUploadComponent>
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

        const activitiesSnap = await this.propertyUpload.getActivities(this.property);
        this.activities = activitiesSnap.docs.map(doc => doc.data() as Activity);
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMore = this.activities.length === this.propertyUpload.initialNumOfActivities;
    }

    async getMoreActivities() {
        const activitiesSnap = await this.propertyUpload.getMoreActivities(this.property, this.lastActivity);
        this.activities.push(...activitiesSnap.docs.map(doc => doc.data() as Activity));
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMore = activitiesSnap.size === this.propertyUpload.initialNumOfActivities;
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
        const deletedFile = this.property.documents!.splice(index, 1);
        if (this.isEditMode) {
            this.deletedFiles.push(deletedFile[0]);
        }
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

    async upload(uploadForm: NgForm) {
        await this.propertyUpload.uploadProperty(this.property, this.uploadedFiles);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('property_upload.upload_successful')),
            undefined,
            { duration: 1500 }
        );

        this.uploadedFiles = [];
        this.property = {
            documents: [],
            description: ''
        } as Property;

        uploadForm.resetForm();

        this.dialogRef.close();
    }

    async edit() {
        await this.propertyUpload.editProperty(this.property, this.uploadedFiles, this.deletedFiles, this.deletedActivities);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('property_upload.edit_successful')),
            undefined,
            { duration: 1500 }
        );

        this.dialogRef.close();
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

    onActivityRemove(activityToRemove: Activity) {
        if (!this.activities?.length) {
            return;
        }

        const index = this.activities.findIndex(activity => activity.id === activityToRemove.id);
        const removed = this.activities.splice(index, 1);
        this.deletedActivities.push(...removed);
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