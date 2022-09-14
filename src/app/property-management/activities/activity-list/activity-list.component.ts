import { Component, EventEmitter, Input, OnChanges, Output, Renderer2 } from '@angular/core';
import { UploadedFile } from '../../property-management.data';
import { Activity } from "../activities-view/activity.data";

export interface DayActivities {
    date?: Date,
    activities: Activity[]
}

@Component({
    selector: 'activity-list',
    templateUrl: 'activity-list.component.html',
    styleUrls: ['./activity-list.component.scss']
})

export class ActivityListComponent implements OnChanges {
    @Input() canDeleteActivities: boolean = false;
    @Input() activities: Activity[] = [];
    @Output() download: EventEmitter<UploadedFile> = new EventEmitter();
    @Output() activityRemoved: EventEmitter<Activity> = new EventEmitter();

    activitiesByDates: DayActivities[] = [];

    constructor(
        private renderer: Renderer2
    ) {
    }

    ngOnChanges(): void {
        this.categorizeActivitiesByDates();
    }

    downloadFile(doc: UploadedFile) {
        this.download.emit(doc);
    }

    showDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.removeStyle(deleteBtn, 'display');
    }

    hideDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.setStyle(deleteBtn, 'display', 'none');
    }

    categorizeActivitiesByDates() {
        this.activitiesByDates = [];

        let currentDate: Date | undefined = undefined;
        let activitiesByDate = {
            activities: []
        } as DayActivities;

        for (let i = 0; i < this.activities.length; i++) {
            const activity = this.activities[i];
            if (!currentDate) {
                currentDate = activity.date?.toDate()!;
                activitiesByDate.date = currentDate;
                this.activitiesByDates.push(activitiesByDate);

            } else if (activity.date?.toDate().getDate() != currentDate!.getDate()) {
                currentDate = activity.date?.toDate();

                activitiesByDate = {} as DayActivities;
                activitiesByDate.date = currentDate;
                activitiesByDate.activities = [];

                this.activitiesByDates.push(activitiesByDate);
            }

            activitiesByDate.activities!.push(activity);
        }
    }

    removeActivity(activityToRemove: Activity) {
        this.activityRemoved.emit(activityToRemove);
        const activities = this.activitiesByDates.find(day => day.date?.getDate() == activityToRemove.date?.toDate().getDate())?.activities;
        if (!activities?.length) {
            return;
        }

        const index = activities?.findIndex(activities => activities.id === activityToRemove.id);
        activities.splice(index, 1);
    }

}