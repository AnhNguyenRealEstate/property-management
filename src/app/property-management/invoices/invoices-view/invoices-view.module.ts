import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { InvoicesViewComponent } from './invoices-view.component';

@NgModule({
    declarations: [InvoicesViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        MatExpansionModule,
        TranslateModule.forChild({ extend: true })
    ],
    exports: [InvoicesViewComponent]
})
export class InvoicesViewModule { }
