import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'src/app/file-upload/file-upload.module';
import { RTEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';

import { PropertyRenewComponent } from './property-renew.component';

@NgModule({
    declarations: [PropertyRenewComponent],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        MatStepperModule,
        RTEditorModule,
        TranslateModule.forChild({ extend: true }),
        PaymentScheduleModule,
        FileUploadModule
    ],
    exports: [PropertyRenewComponent],
})
export class PropertyRenewModule { }
