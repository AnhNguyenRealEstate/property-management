import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivityListModule } from '../../activities/activity-list/activity-list.module';
import { PaymentScheduleModule } from '../../payment-schedule/payment-schedule.module';
import { PropertyDetailsComponent } from './property-details.component';
import { TableModule } from 'ngx-easy-table';
import { ActivityUploadModule } from '../../activities/activity-upload/activity-upload.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
    declarations: [PropertyDetailsComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({
            extend: true
        }),
        ActivityListModule,
        ActivityUploadModule,
        PaymentScheduleModule,
        TableModule,
        MatExpansionModule,
        MatBottomSheetModule,
        NgxDocViewerModule
    ],
    exports: [PropertyDetailsComponent]
})
export class PropertyDetailsModule {
    constructor() { }

    getPropertyDetailsComponent() {
        return PropertyDetailsComponent;
    }
}
