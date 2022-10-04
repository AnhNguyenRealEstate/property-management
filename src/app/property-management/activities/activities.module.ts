import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActivitiesRoutingModule } from './activities-routing.module';

import { ActivitiesViewComponent } from './activities-view/activities-view.component';
import { ActivitiyCalendarComponent } from './activity-calendar/activity-calendar.component';
import { ActivityListModule } from './activity-list/activity-list.module';

@NgModule({
    declarations: [
        ActivitiesViewComponent,
        ActivitiyCalendarComponent],
    imports: [
        CommonModule,
        SharedModule,
        ActivitiesRoutingModule,
        TranslateModule.forChild({ extend: true }),
        CalendarModule.forRoot(
            {
                provide: DateAdapter,
                useFactory: adapterFactory
            }
        ),
        ActivityListModule
    ],
    exports: [ActivitiesViewComponent, ActivitiyCalendarComponent]
})
export class ActivitiesModule { }
