import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleComponent } from './payment-schedule.component';

@NgModule({
    declarations: [PaymentScheduleComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
    ],
    exports: [PaymentScheduleComponent],
    providers: [
        DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    ]
})
export class PaymentScheduleModule { }
