import { Component, OnInit } from '@angular/core';
import { Activity } from '../../activities/activity.data';
import { Property } from '../../properties/property.data';
import { SummaryViewService } from './summary-view.service';

import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { MetadataService } from 'src/app/shared/metadata.service';
import { Router } from '@angular/router';

@Component({
    selector: 'summary-view',
    templateUrl: 'summary-view.component.html',
    styleUrls: ['./summary-view.component.scss']
})

export class SummaryViewComponent implements OnInit {

    pieChartOptions: ChartConfiguration['options'];
    pieChartData!: ChartData<'pie', number[], string | string[]>;
    pieChartType!: ChartType;
    pieChartPlugins = [DatalabelsPlugin];

    soonToExpireProperties: Property[] = [];
    newestActivities: Activity[] = [];

    constructor(
        private summaryView: SummaryViewService,
        private translate: TranslateService,
        private metadata: MetadataService,
        private router: Router
    ) { }

    async ngOnInit() {
        this.soonToExpireProperties = await this.summaryView.getSoonToExpireProps();
        this.newestActivities = await this.summaryView.getRecentActivities();

        this.initChart();
    }

    initChart() {
        this.metadata.propertiesMetadata$.subscribe(value => {
            this.pieChartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    datalabels: {
                        formatter: (_, ctx) => {
                            if (ctx.chart.data.labels) {
                                return ctx.chart.data.labels[ctx.dataIndex];
                            }
                        },
                    },
                }
            };

            const labels: string[] = []
            const data: number[] = []
            if (value.apartmentCount > 0) {
                labels.push(this.translate.instant('property_category.apartment'))
                data.push(value.apartmentCount)
            }
            if (value.villaCount > 0) {
                labels.push(this.translate.instant('property_category.villa'))
                data.push(value.villaCount)
            }
            if (value.townhouseCount > 0) {
                labels.push(this.translate.instant('property_category.townhouse'))
                data.push(value.townhouseCount)
            }
            if (value.commercialCount > 0) {
                labels.push(this.translate.instant('property_category.commercial'))
                data.push(value.commercialCount)
            }

            this.pieChartData = {
                labels: labels,
                datasets: [{
                    data: data
                }]
            };

            this.pieChartType = 'pie';
        });
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

    onChartViewChange(value: string) {
        //TODO
    }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }
}