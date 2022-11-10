import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SummaryViewComponent } from './summary-view/summary-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { SummaryViewRoutingModule } from './summary-routing.module';
import { MatListModule } from '@angular/material/list';
import { NgChartsModule } from 'ng2-charts';
import { PropertyDetailsModule } from '../properties/property-details/property-details.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
@NgModule({
    declarations: [SummaryViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        SummaryViewRoutingModule,
        TranslateModule.forChild({ extend: true }),
        MatListModule,
        NgChartsModule,
        MatBottomSheetModule,
        PropertyDetailsModule
    ],
    exports: [SummaryViewComponent]
})
export class SummaryViewModule { }
