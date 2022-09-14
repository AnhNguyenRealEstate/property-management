import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';

import { ActivityListComponent } from './activity-list.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [ActivityListComponent],
    imports: [
        CommonModule,
        SharedModule,
        MatExpansionModule,
        TranslateModule.forChild(
            { extend: true }
        )
    ],
    exports: [ActivityListComponent]
})
export class ActivityListModule { }
