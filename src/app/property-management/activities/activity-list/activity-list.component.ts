import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PropertyDetailsComponent } from '../../properties/property-details/property-details.component';
import { UploadedFile } from '../../property-management.data';
import { Activity } from "../activities-view/activity.data";
import { ActivityListService } from './activity-list.service';

export interface DayActivities {
    date?: Date,
    activities: Activity[]
}

@Component({
    selector: 'activity-list',
    templateUrl: 'activity-list.component.html',
    styleUrls: ['./activity-list.component.scss'],
    animations: [
        trigger('activityItemAnim',
            [
                transition('* => *', // whenever binding value changes
                    query(':enter',
                        [
                            style({ opacity: 0, transform: 'translateY(40px)' }),
                            stagger(100, [
                                animate('0.2s', style({ opacity: 1, transform: 'translateY(0)' }))
                            ])
                        ],
                        { optional: true }
                    )
                )
            ]
        )
    ]
})

export class ActivityListComponent implements OnChanges {
    @Input() canDeleteActivities: boolean = false;
    @Input() activities: Activity[] = [];
    @Output() download: EventEmitter<UploadedFile> = new EventEmitter();
    @Output() activityRemoved: EventEmitter<Activity> = new EventEmitter();

    activitiesByDates: DayActivities[] = [];

    constructor(
        private renderer: Renderer2,
        private activityList: ActivityListService,
        private dialog: MatDialog
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

    async showPropertyDetails(propertyId: string) {
        const property = await this.activityList.getProperty(propertyId);

        const config = {
            height: '90%',
            width: '80%',
            autoFocus: false,
            data: {
                property: property
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyDetailsComponent, config);
    }

}