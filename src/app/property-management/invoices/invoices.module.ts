import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentScheduleModule } from '../payment-schedule/payment-schedule.module';
import { InvoiceListModule } from './invoice-list/invoice-list.module';
import { NgxPrintModule } from 'ngx-print';
import { InvoicesViewComponent } from './invoices-view/invoices-view.component';
import { TableModule } from 'ngx-easy-table';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InvoicesRoutingModule } from './invoices-routing.module';

@NgModule({
    declarations: [InvoicesViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        InvoicesRoutingModule,
        TranslateModule.forChild({ extend: true }),
        PaymentScheduleModule,
        InvoiceListModule,
        NgxPrintModule,
        TableModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    exports: [InvoicesViewComponent],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    ]
})
export class InvoicesViewModule { }
