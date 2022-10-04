import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SummaryViewComponent } from './summary-view/summary-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { SummaryViewRoutingModule } from './summary-routing.module';
import { MatListModule } from '@angular/material/list';

@NgModule({
    declarations: [SummaryViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        SummaryViewRoutingModule,
        TranslateModule.forChild({ extend: true }),
        MatListModule
    ],
    exports: [SummaryViewComponent]
})
export class SummaryViewModule { }
