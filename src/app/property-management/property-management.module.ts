import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyManagementComponent } from './property-management.component';
import { PropertyManagementRoutingModule } from './property-management-routing';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatSidenavModule } from '@angular/material/sidenav';

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
