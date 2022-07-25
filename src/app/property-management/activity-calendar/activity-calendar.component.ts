import { Component, Input, OnInit } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils'
import { isSameDay, isSameMonth } from 'date-fns';
import { Activity } from '../property-management.data';

@Component({
    selector: 'activity-calendar',
    templateUrl: './activity-calendar.component.html'
})

export class ActivitiyCalendarComponent implements OnInit {
    @Input() activities: Activity[] = [];
    calendarEvents: CalendarEvent<Activity>[] = [];
    viewDate!: Date;
    view: CalendarView = CalendarView.Month;
    showEventsFromDay = false;

    constructor(
    ) { }

    ngOnInit() {
        if (!this.activities.length) {
            return;
        }

        this.viewDate = new Date();

        this.calendarEvents = this.activities.map<CalendarEvent>(activity => {
            return {
                start: activity.date?.toDate(),
                title: `${activity.propertyName} - ${activity.description}`,
                meta: activity
            } as CalendarEvent
        });
    }

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        if (isSameMonth(date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, date) && this.showEventsFromDay === true) ||
                events.length === 0
            ) {
                this.showEventsFromDay = false;
            } else {
                this.showEventsFromDay = true;
            }
            this.viewDate = date;
        }
    }

    getPreviousMonthActivities() {
        // TODO
    }

    getNextMonthActivities() {
        // TODO
    }

}