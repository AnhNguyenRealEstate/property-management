import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { CalendarView } from 'angular-calendar';
import { CalendarEvent } from 'calendar-utils'
import { isSameDay, isSameMonth } from 'date-fns';
import { lastValueFrom, Subscription } from 'rxjs';
import { Role, RolesService } from 'src/app/shared/roles.service';
import { Activity } from "../activities-view/activity.data";
import { ActivityCalendarService } from './activity-calendar.service';

@Component({
    selector: 'activity-calendar',
    templateUrl: './activity-calendar.component.html'
})

export class ActivitiyCalendarComponent implements OnInit, OnDestroy {
    userRoles: Role[] = [];
    activities: Activity[] = [];

    calendarEvents: CalendarEvent<Activity>[] = [];
    viewDate!: Date;
    view: CalendarView = CalendarView.Month;
    showEventsFromDay = false;

    subs: Subscription = new Subscription();

    constructor(
        private roles: RolesService,
        private auth: Auth,
        public activityCalendar: ActivityCalendarService
    ) { }

    ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
            this.viewDate = new Date();
            this.userRoles = roles;

            if (roles.includes('customer-service')) {
                this.activities = await this.activityCalendar.getActivities(undefined, this.viewDate);
            } else if (roles.includes('owner') && this.auth.currentUser?.email) {
                this.activities = await this.activityCalendar.getActivities(this.auth.currentUser.email, this.viewDate);
            }

            if (!this.activities.length) {
                return;
            }

            this.calendarEvents = this.activities.map<CalendarEvent>(activity => {
                return {
                    start: activity.date?.toDate(),
                    title: `${activity.propertyName} - ${activity.description}`,
                    meta: activity
                } as CalendarEvent
            });
        }));
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
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

    async getMonthActivities(newDate: Date) {
        const username = this.userRoles.includes('owner') ? this.auth.currentUser?.email : '';
        const activities = await this.activityCalendar.getActivitiesFrom(username || '', newDate);
        this.calendarEvents = activities.map<CalendarEvent>(activity => {
            return {
                start: activity.date?.toDate(),
                title: `${activity.propertyName} - ${activity.description}`,
                meta: activity
            } as CalendarEvent
        });
    }

}