import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyManagementComponent } from './property-management.component';
import { PropertyManagementRoutingModule } from './property-management-routing';
import { SharedModule } from '../shared/shared.module';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { PropertyCardComponent } from './property-card/property-card.component';
import { PropertyUploadModule } from './property-upload/property-upload.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ActivityUploadComponent } from './activity-upload/activity-upload.component';
import { ActivityListModule } from './activity-list/activity-list.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PropertiesViewComponent } from './properties-view/properties-view.component';
import { ActivitiesViewComponent } from './activities-view/activities.component';
import { SummaryViewComponent } from './summary-view/summary-view.component';


@NgModule({
  declarations: [
    PropertyManagementComponent,
    PropertyDetailsComponent,
    PropertyCardComponent,
    ActivityUploadComponent,
    PropertiesViewComponent,
    ActivitiesViewComponent,
    SummaryViewComponent
  ],
  imports: [
    CommonModule,
    PropertyManagementRoutingModule,
    SharedModule,
    MatTableModule,
    TranslateModule.forChild(
      { extend: true }
    ),
    PropertyUploadModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    ActivityListModule,
    MatTabsModule,
    MatSidenavModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class PropertyManagementModule {
}
