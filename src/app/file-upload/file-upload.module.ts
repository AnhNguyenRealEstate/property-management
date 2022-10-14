import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';

import { FileUploadComponent } from './file-upload.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true })
    ],
    exports: [FileUploadComponent],
    declarations: [FileUploadComponent],
    providers: [],
})
export class FileUploadModule { }
