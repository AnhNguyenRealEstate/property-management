import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivityUploadModule } from '../activities/activity-upload/activity-upload.module';
import { ContractExtractionModule } from '../contract-extraction/contract-extraction.module';
import { PropertiesRoutingModule } from './properties-routing.module';

import { PropertiesViewComponent } from './properties-view/properties-view.component';
import { PropertyCardComponent } from './property-card/property-card.component';
import { PropertyDetailsModule } from './property-details/property-details.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        PropertiesRoutingModule,
        MatProgressBarModule,
        ActivityUploadModule,
        ContractExtractionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DatePipe,
        PropertyDetailsModule
    ],
    exports: [PropertiesViewComponent],
    declarations: [PropertiesViewComponent, PropertyCardComponent],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {
                ...new MatDialogConfig(),
                enterAnimationDuration: '200ms',
                exitAnimationDuration: '200ms'
            }
        }
    ]

})
export class PropertiesViewModule { }
