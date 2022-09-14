import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivityListModule } from '../../activities/activity-list/activity-list.module';

import { PropertyDetailsComponent } from './property-details.component';

@NgModule({
    declarations: [PropertyDetailsComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({
            extend: true
        }),
        ActivityListModule
    ],
    exports: [PropertyDetailsComponent]
})
export class PropertyDetailsModule { }
