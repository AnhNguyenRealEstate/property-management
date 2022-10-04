import { Component, OnInit } from '@angular/core';
import { Activity } from '../../activities/activity.data';
import { Property } from '../../properties/property.data';
import { SummaryViewService } from './summary-view.service';

@Component({
    selector: 'summary-view',
    templateUrl: 'summary-view.component.html',
    styleUrls: ['./summary-view.component.scss']
})

export class SummaryViewComponent implements OnInit {
    soonToExpireProperties: Property[] = [];
    newestActivities: Activity[] = [];

    constructor(
        private summaryView: SummaryViewService
    ) { }

    async ngOnInit() {
        this.soonToExpireProperties = await this.summaryView.getSoonToExpireProps();
    }

    calculateExpiry(property: Property): string {
        const endDate = property.managementEndDate?.toDate();
        const today = new Date();

        if (!endDate) {
            return '';
        }

        let months;
        months = (endDate.getFullYear() - today.getFullYear()) * 12;
        months -= today.getMonth();
        months += endDate.getMonth();
        return months <= 0 ? '0' : String(months);
    }
}