import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { LabelSpanModule } from 'src/app/label-span/label-span.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PropertyDetailsModule } from '../../properties/property-details/property-details.module';

import { InvoiceListComponent } from './invoice-list.component';

@NgModule({
    declarations: [InvoiceListComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        MatExpansionModule,
        PropertyDetailsModule,
        LabelSpanModule
    ],
    exports: [InvoiceListComponent]
})
export class InvoiceListModule { }
