import { Component, Input, OnInit } from '@angular/core';
import { CalendarEvent } from 'calendar-utils'
import { Activity } from '../property-management.data';

@Component({
    selector: 'activity-calendar',
    templateUrl: './activity-calendar.component.html'
})

export class ActivitiyCalendarComponent implements OnInit {
    @Input() activities: Activity[] = [];
    calendarEvents: CalendarEvent<Activity>[] = [];
    viewDate!: Date;

    constructor() { }

    ngOnInit() {
        if (!this.activities.length) {
            return;
        }
        
        this.viewDate = this.activities[0].date!.toDate();

        this.calendarEvents = this.activities.map<CalendarEvent>(activity => {
            return {
                start: activity.date?.toDate(),
                title: activity.description,
                meta: activity
            } as CalendarEvent
        });
    }

}