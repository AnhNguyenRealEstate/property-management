import { Component, ElementRef, OnDestroy, OnInit, Pipe, PipeTransform, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { PropertyDetailsComponent } from '../property-details/property-details.component';
import { Property } from "../property.data";
import { PropertiesViewService } from './properties-view.service';
import { PropertyUploadComponent } from '../property-upload/property-upload.component';
import { trigger, transition, query, style, animate, stagger } from '@angular/animations';
import { MetadataService, PropertiesMetadata } from 'src/app/shared/metadata.service';
import { ContractType } from '../property-upload/property-upload.data';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Pipe({
    name: 'propFilter'
})
export class PropertyFilterPipe implements PipeTransform {
    transform(value: Property[], query: string): Property[] {
        if (!query) {
            return value;
        }

        return value.filter(property => {
            return property.name?.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || property.owner?.contactName?.toLowerCase().indexOf(query.toLowerCase()) !== -1
                || property.tenantName?.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
    }
}
@Component({
    selector: 'properties-view',
    templateUrl: 'properties-view.component.html',
    styleUrls: ['./properties-view.component.scss'],
    animations: [
        trigger('propertyCardAnim',
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

export class PropertiesViewComponent implements OnInit, OnDestroy {
    apartments: Property[] = [];
    townhouses: Property[] = [];
    villas: Property[] = [];
    commercials: Property[] = [];

    subs: Subscription = new Subscription();

    propertiesMetadata = {} as PropertiesMetadata;

    searchInput: string = '';

    itemsPerPage: number = 8;
    apartmentsCurrentPage: number = 1;
    townhousesCurrentPage: number = 1;
    villasCurrentPage: number = 1;
    commercialsCurrentPage: number = 1;

    constructor(
        private dialog: MatDialog,
        private bottomSheet: MatBottomSheet,
        public roles: UserProfileService,
        public propertiesView: PropertiesViewService,
        public metadata: MetadataService
    ) {
    }

    async ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
            if (roles.includes('customer-service')) {
                this.apartments = await this.propertiesView.getProperties('Apartment');
            }
        }));

        this.subs.add(this.metadata.propertiesMetadata$.subscribe(data => {
            this.propertiesMetadata = data;
        }));
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    showDetails(property: Property) {
        const config = {
            autoFocus: false,
            disableClose: false,
            data: {
                property: property
            }
        } as MatBottomSheetConfig;
        this.bottomSheet.open(PropertyDetailsComponent, config);
    }

    propertyRemoved(properties: Property[], propToRemove: Property) {
        const index = properties.findIndex(property => property.id === propToRemove.id);
        if (index === -1) {
            return;
        }

        properties.splice(index, 1);
    }

    registerProperty() {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                contractType: ContractType.rental
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyUploadComponent, config).afterClosed().subscribe(result => {
            if (result.success) {
                const prop = result.data as Property;
                switch (prop.category) {
                    case 'Apartment':
                        this.apartments.unshift(prop);
                        this.propertiesMetadata.apartmentCount++;
                        break;
                    case 'Commercial':
                        this.commercials.unshift(prop);
                        this.propertiesMetadata.commercialCount++;
                        break;
                    case 'Townhouse':
                        this.townhouses.unshift(prop);
                        this.propertiesMetadata.townhouseCount++;
                        break;
                    case 'Villa':
                        this.villas.unshift(prop);
                        this.propertiesMetadata.villaCount++;
                        break;
                }
            }
        });
    }

    async onTabChange($event: number) {
        switch ($event) {
            case 0:
                this.apartments = await this.propertiesView.getProperties('Apartment');
                break;
            case 1:
                this.villas = await this.propertiesView.getProperties('Villa');
                break;
            case 2:
                this.townhouses = await this.propertiesView.getProperties('Townhouse');
                break;
            case 3:
                this.commercials = await this.propertiesView.getProperties('Commercial');
                break;
        }
    }
}

