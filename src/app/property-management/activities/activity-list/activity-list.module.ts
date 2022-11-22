import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';

import { ActivityListComponent } from './activity-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { TableModule } from 'ngx-easy-table';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
    declarations: [ActivityListComponent],
    imports: [
        CommonModule,
        SharedModule,
        MatExpansionModule,
        TranslateModule.forChild(
            { extend: true }
        ),
        MatBottomSheetModule,
        TableModule,
        NgxDocViewerModule,
        MatNativeDateModule,
        MatTooltipModule
    ],
    exports: [ActivityListComponent],
    providers: [DatePipe, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },]
})
export class ActivityListModule { }
