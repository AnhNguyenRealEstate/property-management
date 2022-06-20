import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Activity, UploadedFile } from '../property-management.data';

@Component({
    selector: 'activity-upload',
    templateUrl: 'activity-upload.component.html',
    styleUrls: ['./activity-upload.component.scss']
})

export class ActivityUploadComponent implements OnInit {
    @Output() activityAdded: EventEmitter<any> = new EventEmitter<any>();

    date!: Date;
    description: string = '';
    newActivityAttachments: UploadedFile[] = [];
    newFiles: File[] = [];

    constructor(
        private auth: Auth
    ) { }

    ngOnInit() { }

    onActivityFileUpload(event: any) {
        const files = (event.target.files as FileList);
        if (files.length === 0) {
            return;
        }

        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i)!;

            const fileDoesNotExistYet = this.newActivityAttachments?.length
                && this.newActivityAttachments.find(doc => doc.displayName === file.name)
            if (fileDoesNotExistYet) {
                continue;
            }

            newFiles.unshift(file);
        }

        if (!this.newActivityAttachments?.length) {
            this.newActivityAttachments = [];
        }

        this.newActivityAttachments.unshift(...newFiles.map(file => {
            return {
                displayName: file.name,
                dbHashedName: this.generateHash(file.name)
            } as UploadedFile
        }));

        this.newFiles.unshift(...newFiles);
    }

    onFileRemove(index: number) {
        this.newActivityAttachments.splice(index, 1);
    }

    onFileNameChange(oldDisplayName: string, newDisplayName: string, file: UploadedFile) {
        if (this.newActivityAttachments.find(file => file.displayName === newDisplayName)) {
            return;
        }

        const fileToAmend = this.newFiles.find(file => file.name === oldDisplayName);
        if (!fileToAmend) {
            return;
        }

        Object.defineProperty(fileToAmend, 'name', {
            writable: true,
            value: newDisplayName
        });

        file.displayName = newDisplayName;
        file.dbHashedName = this.generateHash(newDisplayName);
    }

    uploadedFileDrop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.newActivityAttachments!, event.previousIndex, event.currentIndex);
    }

    private generateHash(str: string, seed?: number) {
        const date = new Date();
        str = str + `-${date.getMonth()}${date.getDate()}-${Math.random() * 1000000}`;

        //https://www.codegrepper.com/code-examples/javascript/hash+a+string+angular
        /*jshint bitwise:false */
        let i, l, hval = (seed === undefined) ? 0x811c9dc5 : seed;
        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substring(-8);
    }

    doesFileNameAlreadyExist(name: string) {
        return !!this.newActivityAttachments?.find(doc => doc.displayName === name) &&
            !!this.newActivityAttachments?.find(doc => doc.displayName === name);
    }

    addActivity(form: NgForm) {
        if (!this.auth.currentUser?.email) {
            return;
        }

        this.activityAdded.emit({
            activity: {
                date: Timestamp.fromDate(this.date),
                description: this.description,
                documents: this.newActivityAttachments,
                owner: this.auth.currentUser?.email || ''
            } as Activity,
            newFiles: this.newFiles
        });

        form.resetForm({});
        this.newActivityAttachments = [];
        this.newFiles = [];
    }
}