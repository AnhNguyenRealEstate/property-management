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
import { ContractExtensionModule } from './contract-extension/contract-extension.module';
import { PropertiesRoutingModule } from './properties-routing.module';

import { PropertiesViewComponent, PropertyFilterPipe } from './properties-view/properties-view.component';
import { PropertyCardComponent } from './property-card/property-card.component';
import { PropertyDetailsModule } from './property-details/property-details.module';
import { PropertyEditModule } from './property-edit/property-edit.module';
import { PropertyRenewModule } from './property-renew/property-renew.module';
import { PropertyUploadModule } from './property-upload/property-upload.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        PropertiesRoutingModule,
        MatProgressBarModule,
        ContractExtractionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DatePipe,
        PropertyDetailsModule,
        PropertyUploadModule,
        PropertyRenewModule,
        PropertyEditModule,
        ContractExtensionModule
    ],
    exports: [PropertiesViewComponent],
    declarations: [PropertiesViewComponent, PropertyCardComponent, PropertyFilterPipe],
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
