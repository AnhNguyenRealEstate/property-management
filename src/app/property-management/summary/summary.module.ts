import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SummaryViewComponent } from './summary-view/summary-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { SummaryRoutingModule } from './summary-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { PropertyDetailsModule } from '../properties/property-details/property-details.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ActivityListModule } from '../activities/activity-list/activity-list.module';
@NgModule({
    declarations: [SummaryViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        SummaryRoutingModule,
        TranslateModule.forChild({ extend: true }),
        NgChartsModule,
        MatBottomSheetModule,
        PropertyDetailsModule,
        ActivityListModule
    ],
    exports: [SummaryViewComponent]
})
export class SummaryModule { }
