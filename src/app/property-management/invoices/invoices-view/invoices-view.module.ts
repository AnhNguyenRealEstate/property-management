import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';

import { InvoicesViewComponent } from './invoices-view.component';

@NgModule({
    declarations: [InvoicesViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        PaymentScheduleModule
    ],
    exports: [InvoicesViewComponent]
})
export class InvoicesViewModule { }
