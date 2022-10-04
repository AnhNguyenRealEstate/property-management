import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { ActivityUploadComponent } from './activity-upload.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true })
    ],
    exports: [ActivityUploadComponent],
    declarations: [ActivityUploadComponent]
})
export class ActivityUploadModule { }
