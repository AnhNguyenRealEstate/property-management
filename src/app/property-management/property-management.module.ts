import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyManagementComponent } from './property-management.component';
import { PropertyManagementRoutingModule } from './property-management-routing';
import { SharedModule } from '../shared/shared.module';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { PropertyCardComponent } from './property-card/property-card.component';
import { PropertyEditModule } from './property-edit/property-edit.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ActivityUploadComponent } from './activity-upload/activity-upload.component';
import { ActivityListModule } from './activity-list/activity-list.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PropertiesViewComponent } from './properties-view/properties-view.component';
import { ActivitiesViewComponent } from './activities-view/activities-view.component';
import { SummaryViewComponent } from './summary-view/summary-view.component';
import { OwnersViewComponent } from './owners-view/owners-view.component';
import { OwnerListModule } from './owner-list/owner-list.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ActivitiyCalendarComponent } from './activity-calendar/activity-calendar.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { OwnerUploadModule } from './owner-upload/owner-upload.module';
import { PropertyDetailsModule } from './property-details/property-details.module';
import { ContractExtractionModule } from './contract-extraction/contract-extraction.module';
import { PropertyUploadModule } from './property-upload/property-upload.module';

@NgModule({
  declarations: [
    PropertyManagementComponent,
    PropertyCardComponent,
    ActivityUploadComponent,
    PropertiesViewComponent,
    ActivitiesViewComponent,
    ActivitiyCalendarComponent,
    SummaryViewComponent,
    OwnersViewComponent
  ],
  imports: [
    CommonModule,
    PropertyManagementRoutingModule,
    SharedModule,
    MatTableModule,
    TranslateModule.forChild(
      { extend: true }
    ),
    PropertyEditModule,
    PropertyUploadModule,
    PropertyDetailsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    ActivityListModule,
    OwnerListModule,
    OwnerUploadModule,
    MatTabsModule,
    MatSidenavModule,
    CalendarModule.forRoot(
      {
        provide: DateAdapter,
        useFactory: adapterFactory
      }
    ),
    MatButtonToggleModule,
    ContractExtractionModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class PropertyManagementModule {
}
