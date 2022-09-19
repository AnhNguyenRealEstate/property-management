import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
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
    providers: [DatePipe]
})
export class PaymentScheduleModule { }
