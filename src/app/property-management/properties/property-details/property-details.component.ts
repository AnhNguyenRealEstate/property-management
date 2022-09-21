import { Component, Inject, OnInit, Optional } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolesService } from 'src/app/shared/roles.service';
import { Activity } from '../../activities/activities-view/activity.data';
import { Invoice } from '../../invoices/invoices.data';
import { PaymentSchedule } from '../../payment-schedule/payment-schedule.data';
import { UploadedFile } from '../../property-management.data';
import { Property } from "../property-card/property-card.data";
import { PropertyDetailsService } from './property-details.service';

@Component({
    selector: 'property-details',
    templateUrl: 'property-details.component.html',
    styleUrls: ['./property-details.component.scss']
})

export class PropertyDetailsComponent implements OnInit {
    property!: Property;

    activities: Activity[] = [];
    lastActivity!: DocumentSnapshot;
    showViewMoreActivities: boolean = false;

    schedules: PaymentSchedule[] = [];
    showViewMoreSchedules: boolean = false;

    constructor(
        private propertyDetails: PropertyDetailsService,
        public roles: RolesService,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.property = this.data.property;
    }

    async ngOnInit() {
        this.getActivities();
    }

    async getActivities() {
        const activitiesSnap = await this.propertyDetails.getActivities(this.property);
        this.activities = activitiesSnap.docs.map(doc => doc.data() as Activity);
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMoreActivities = this.activities.length === this.propertyDetails.initialNumOfActivities;
    }

    async getMoreActivities() {
        const activitiesSnap = await this.propertyDetails.getMoreActivities(this.property, this.lastActivity);
        this.activities.push(...activitiesSnap.docs.map(doc => doc.data() as Activity));
        this.lastActivity = activitiesSnap.docs[activitiesSnap.docs.length - 1];
        this.showViewMoreActivities = activitiesSnap.size === this.propertyDetails.initialNumOfActivities;
    }

    getPaymentSchedules() {
        throw new Error("Not implemented")
    }

    getMorePaymentSchedules() {
        throw new Error("Not implemented")
    }

    async downloadDoc(doc: UploadedFile) {
        const file = await this.propertyDetails.downloadDoc(`${this.property.fileStoragePath}/${doc.dbHashedName}`);
        const url = window.URL.createObjectURL(file);
        window.open(url);
    }

    timestampToDate(stamp: any): Date {
        return new Date((stamp as any).seconds * 1000);
    }
}