import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';
import { InvoiceListModule } from '../invoice-list/invoice-list.module';
import { NgxPrintModule } from 'ngx-print';
import { InvoicesViewComponent } from './invoices-view.component';

@NgModule({
    declarations: [InvoicesViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        PaymentScheduleModule,
        InvoiceListModule,
        NgxPrintModule
    ],
    exports: [InvoicesViewComponent]
})
export class InvoicesViewModule { }
