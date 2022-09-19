import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';

import { PropertyUploadComponent } from './property-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RTEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module';
import { AutoFocusDirective } from './auto-focus-on-error.directive';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';

@NgModule({
    declarations: [PropertyUploadComponent, AutoFocusDirective],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        MatStepperModule,
        RTEditorModule,
        TranslateModule.forChild({ extend: true }),
        PaymentScheduleModule
    ],
    exports: [PropertyUploadComponent]
})
export class PropertyUploadModule { }
