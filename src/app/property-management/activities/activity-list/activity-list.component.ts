import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, createComponent, createNgModule, DoCheck, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { BehaviorSubject, lastValueFrom, Observable, Subscription } from 'rxjs';
import { PropertyDetailsComponent } from '../../properties/property-details/property-details.component';
import { PropertyDetailsModule } from '../../properties/property-details/property-details.module';
import { UploadedFile } from '../../property-management.data';
import { Activity, ActivityType } from "../activity.data";
import { ActivityListService } from './activity-list.service';

export interface DayActivities {
    date?: Date,
    activities: Activity[]
}

@Component({
    selector: 'activity-list',
    templateUrl: 'activity-list.component.html',
    styleUrls: ['./activity-list.component.scss']
})

export class ActivityListComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
    @Input() canDeleteActivities: boolean = false;
    @Input() activities: Activity[] = [];
    @Input() showPropertyName: boolean = true;
    @Input() showViewMore: boolean = true;
    @Input() showSearch: boolean = true;

    @Output() getMoreActivities: EventEmitter<void> = new EventEmitter();

    numberOfActivities = 0;

    subs: Subscription = new Subscription();

    activitiesByDates$$: BehaviorSubject<DayActivities[]> = new BehaviorSubject<DayActivities[]>([]);
    activitiesByDates$: Observable<DayActivities[]> = this.activitiesByDates$$.asObservable();

    searchQuery$$: BehaviorSubject<string> = new BehaviorSubject('');
    searchQuery$: Observable<string> = this.searchQuery$$.asObservable();

    typeQuery$$: BehaviorSubject<ActivityType | ''> = new BehaviorSubject<ActivityType | ''>('');
    typeQuery$: Observable<ActivityType | ''> = this.typeQuery$$.asObservable();

    constructor(
        private renderer: Renderer2,
        private activityList: ActivityListService,
        private bottomSheet: MatBottomSheet,
        private injector: Injector
    ) {
        this.subs.add(this.searchQuery$.subscribe(async propNameQuery => {
            const filteredActivities = this.applyFilters(propNameQuery, this.typeQuery$$.getValue())
            this.activitiesByDates$$.next(
                this.categorizeActivitiesByDates(filteredActivities)
            );
        }))

        this.subs.add(this.typeQuery$.subscribe(async typeQuery => {
            const filteredActivities = this.applyFilters(this.searchQuery$$.getValue(), typeQuery)
            this.activitiesByDates$$.next(
                this.categorizeActivitiesByDates(filteredActivities)
            );
        }))
    }

    ngOnInit(): void {
        this.numberOfActivities = this.activities.length;
    }

    ngDoCheck(): void {
        if (this.activities.length !== this.numberOfActivities) {
            this.ngOnChanges();
            this.numberOfActivities = this.activities.length;
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }

    async ngOnChanges() {
        const filteredActivities = this.applyFilters(
            this.searchQuery$$.getValue(),
            this.typeQuery$$.getValue()
        )

        this.activitiesByDates$$.next(
            this.categorizeActivitiesByDates(filteredActivities)
        );
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

    categorizeActivitiesByDates(activities: Activity[]): DayActivities[] {
        const activitiesByDates = [];

        let currentDate: Date | undefined = undefined;
        let activitiesByDate = {
            activities: []
        } as DayActivities;

        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            if (!currentDate) {
                currentDate = activity.date?.toDate()!;
                activitiesByDate.date = currentDate;
                activitiesByDates.push(activitiesByDate);

            } else if (activity.date?.toDate().getDate() != currentDate!.getDate()) {
                currentDate = activity.date?.toDate();

                activitiesByDate = {} as DayActivities;
                activitiesByDate.date = currentDate;
                activitiesByDate.activities = [];

                activitiesByDates.push(activitiesByDate);
            }

            activitiesByDate.activities!.push(activity);
        }

        return activitiesByDates;
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

    applyFilters(propName: string, typeQuery: ActivityType | ''): Activity[] {
        let filteredActivities = this.activities;

        if (propName) {
            filteredActivities = this.activities.filter(activity =>
                activity.propertyName?.toLowerCase().indexOf(propName.toLowerCase().trim()) !== -1
            );
        }

        if (typeQuery) {
            filteredActivities = filteredActivities.filter(activity => activity.type === typeQuery);
        }

        return filteredActivities;
    }
}