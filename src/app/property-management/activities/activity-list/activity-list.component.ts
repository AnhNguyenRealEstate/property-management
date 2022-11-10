import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, createComponent, createNgModule, DoCheck, EventEmitter, Injector, Input, OnChanges, Output, Renderer2 } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { PropertyDetailsComponent } from '../../properties/property-details/property-details.component';
import { PropertyDetailsModule } from '../../properties/property-details/property-details.module';
import { UploadedFile } from '../../property-management.data';
import { Activity } from "../activity.data";
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

export class ActivityListComponent implements OnChanges, DoCheck {
    @Input() canDeleteActivities: boolean = false;
    @Input() activities: Activity[] = [];
    @Input() showPropertyName: boolean = true;

    @Output() getMoreActivities: EventEmitter<void> = new EventEmitter();

    activitiesByDates: DayActivities[] = [];
    numberOfActivities = 0;

    searchQuery: string = '';

    constructor(
        private renderer: Renderer2,
        private activityList: ActivityListService,
        private bottomSheet: MatBottomSheet,
        private injector: Injector
    ) {
    }

    ngDoCheck(): void {
        if (this.activities.length !== this.numberOfActivities) {
            this.ngOnChanges();
        }
    }

    ngOnChanges(): void {
        this.categorizeActivitiesByDates(this.activities);
    }

    async downloadDoc(activity: Activity, doc: UploadedFile) {
        const blob = await this.activityList.downloadDoc(`${activity.fileStoragePath}/${doc.dbHashedName}`);
        const file = new File([blob], doc.displayName!)
        const url = window.URL.createObjectURL(file);

        const fileLink = document.createElement('a');
        fileLink.href = url;
        fileLink.download = doc.displayName!;
        fileLink.click();
    }

    showDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.removeStyle(deleteBtn, 'display');
    }

    hideDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.setStyle(deleteBtn, 'display', 'none');
    }

    categorizeActivitiesByDates(activities: Activity[]) {
        this.activitiesByDates = [];

        let currentDate: Date | undefined = undefined;
        let activitiesByDate = {
            activities: []
        } as DayActivities;

        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
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

        this.numberOfActivities = this.activities.length;
    }

    async removeActivity(activityToRemove: Activity) {
        const activities = this.activitiesByDates.find(day => day.date?.getDate() == activityToRemove.date?.toDate().getDate())?.activities;
        if (!activities?.length) {
            return;
        }

        const index = activities?.findIndex(activities => activities.id === activityToRemove.id);
        activities.splice(index, 1);

        await this.activityList.removeActivity(activityToRemove);
    }

    filterActivitiesByPropName(name: string) {
        const filteredActivities = this.activities.filter(activity =>
            activity.propertyName?.toLowerCase().indexOf(name.toLowerCase().trim()) !== -1
        );

        this.categorizeActivitiesByDates(filteredActivities);
    }

    async showDetails(propertyId: string) {
        const { PropertyDetailsModule } = await import("src/app/property-management/properties/property-details/property-details.module");

        const moduleRef = createNgModule(PropertyDetailsModule, this.injector);
        const propertyDetailsComponent = moduleRef.instance.getPropertyDetailsComponent();

        const property = await this.activityList.getProperty(propertyId);
        const config = {
            autoFocus: false,
            disableClose: false,
            data: {
                property: property
            }
        } as MatBottomSheetConfig;
        this.bottomSheet.open(propertyDetailsComponent, config);
    }

}