import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'src/app/file-upload/file-upload.module';
import { LabelSpanModule } from 'src/app/label-span/label-span.module';
import { RTEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';

import { ContractExtensionComponent } from './contract-extension.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        TranslateModule.forChild({ extend: true }),
        MatStepperModule,
        RTEditorModule,
        PaymentScheduleModule,
        FileUploadModule,
        LabelSpanModule
    ],
    exports: [ContractExtensionComponent],
    declarations: [ContractExtensionComponent]
})
export class ContractExtensionModule { }
