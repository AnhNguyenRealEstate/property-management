import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { OwnerUploadComponent } from './owner-upload.component';

@NgModule({
    declarations: [OwnerUploadComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({
            extend: true
        })
    ],
    exports: [OwnerUploadComponent]
})
export class OwnerUploadModule { }
