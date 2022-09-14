import { Component, Inject, OnInit, Optional } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { Owner } from "../owners-view/owner.data";
import { OwnerUploadService } from './owner-upload.service';

@Component({
    selector: 'owner-upload',
    templateUrl: './owner-upload.component.html'
})

export class OwnerUploadComponent implements OnInit {
    owner: Owner = {};
    isEditMode: boolean = false;

    constructor(
        private ownerUpload: OwnerUploadService,
        private snackbar: MatSnackBar,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        @Optional() private dialogRef: MatDialogRef<OwnerUploadComponent>
    ) {
        if (this.data) {
            this.owner = this.data.owner as Owner;
            this.isEditMode = this.data.isEditMode;
        }
    }

    ngOnInit() {

    }

    async upload(uploadForm: NgForm) {
        await this.ownerUpload.upload(this.owner);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('owner_upload.upload_successful')),
            undefined,
            { duration: 1500 }
        )

        uploadForm.resetForm();
        this.dialogRef.close();
    }

    async edit() {
        await this.ownerUpload.edit(this.owner);

        this.snackbar.open(
            await lastValueFrom(this.translate.get('owner_upload.edit_successful')),
            undefined,
            { duration: 1500 }
        )

        this.dialogRef.close();
    }
}