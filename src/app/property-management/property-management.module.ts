import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyManagementComponent } from './property-management.component';
import { PropertyManagementRoutingModule } from './property-management-routing';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PropertiesViewComponent } from './properties/properties-view/properties-view.component';
import { ActivitiesViewComponent } from './activities/activities-view/activities-view.component';
import { OwnersViewComponent } from './owners/owners-view/owners-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ContractExtractionModule } from './contract-extraction/contract-extraction.module';
import { ActivityListModule } from './activities/activity-list/activity-list.module';
import { ActivityUploadComponent } from './activities/activity-upload/activity-upload.component';
import { OwnerListModule } from './owners/owner-list/owner-list.module';
import { OwnerUploadModule } from './owners/owner-upload/owner-upload.module';
import { PropertyEditModule } from './properties/property-edit/property-edit.module';
import { PropertyUploadModule } from './properties/property-upload/property-upload.module';
import { PropertyCardComponent } from './properties/property-card/property-card.component';
import { InvoicesViewModule } from './invoices/invoices.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogConfig, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

@NgModule({
  declarations: [
    PropertyManagementComponent
  ],
  imports: [
    CommonModule,
    PropertyManagementRoutingModule,
    SharedModule,
    MatSidenavModule,
    TranslateModule.forChild(
      { extend: true }
    )
  ]
})
export class PropertyManagementModule {
}
