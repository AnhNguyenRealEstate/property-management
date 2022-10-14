import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UploadedFile } from '../property-management/property-management.data';
import { HashingService } from '../shared/hashing.service';

@Component({
    selector: 'file-upload',
    templateUrl: 'file-upload.component.html'
})

export class FileUploadComponent implements OnInit {
    @Input() form!: FormGroup

    @Input() uploadedFiles: UploadedFile[] = [];
    @Output() uploadedFilesChange: EventEmitter<UploadedFile[]> = new EventEmitter();

    @Input() files: File[] = [];
    @Output() filesChange: EventEmitter<File[]> = new EventEmitter();

    constructor(
        private hash: HashingService
    ) { }

    ngOnInit() { }

    onFileUpload(event: any) {
        const files = (event.target.files as FileList);
        if (files.length === 0) {
            return;
        }

        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i)!;

            if (this.uploadedFiles?.length
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
        const removedFile = this.uploadedFiles!.splice(index, 1);

        const idx = this.files.findIndex(file => file.name === removedFile[0].displayName);
        this.files.splice(idx, 1);
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
        moveItemInArray(this.uploadedFiles!, event.previousIndex, event.currentIndex);
    }

    doesFileNameAlreadyExist(name: string) {
        return !!this.uploadedFiles?.find(doc => doc.displayName === name);
    }
}