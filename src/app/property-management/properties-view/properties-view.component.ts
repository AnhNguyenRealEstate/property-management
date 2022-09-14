import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RolesService } from 'src/app/shared/roles.service';
import { PropertyDetailsComponent } from '../property-details/property-details.component';
import { Property } from "../property-card/property-card.data";
import { PropertiesViewService } from './properties-view.service';
import { PropertyUploadComponent } from '../property-upload/property-upload.component';

@Component({
    selector: 'properties-view',
    templateUrl: 'properties-view.component.html',
    styleUrls: ['./properties-view.component.scss']
})

export class PropertiesViewComponent implements OnInit, OnDestroy {
    properties: Property[] = [];
    apartments: Property[] = [];
    townhouses: Property[] = [];
    villas: Property[] = [];
    commercials: Property[] = [];

    subs: Subscription = new Subscription();

    algoliaQuery = '';

    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        public propertiesView: PropertiesViewService,
        private auth: Auth
    ) { }

    async ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
            if (roles.includes('customer-service')) {
                this.properties = await this.propertiesView.getProperties();
                this.sortProperties(this.properties);
            } else if (roles.includes('owner') && this.auth.currentUser?.email) {
                this.properties = await this.propertiesView.getProperties(this.auth.currentUser.email);
                this.sortProperties(this.properties);
            }
        }));
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    showDetails(property: Property) {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: property
            }
        } as MatDialogConfig;
        this.dialog.open(PropertyDetailsComponent, config);
    }

    propertyRemoved(properties: Property[], propToRemove: Property) {
        const index = properties.findIndex(property => property.id === propToRemove.id);
        if (index === -1) {
            return;
        }

        properties.splice(index, 1);
    }

    async searchWithAlgolia() {
        this.properties = (await this.propertiesView.getProperties())
            .filter(property => property.name?.toLowerCase().includes(this.algoliaQuery.toLowerCase()));
    }

    registerProperty() {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: {} as Property,
                isEditMode: false
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyUploadComponent, config).afterClosed().subscribe(result => {
            if (result.success) {
                const prop = result.data as Property;
                switch (prop.category) {
                    case 'Apartment':
                        this.apartments.unshift(prop);
                        break;
                    case 'Commercial':
                        this.commercials.unshift(prop);
                        break;
                    case 'Townhouse':
                        this.townhouses.unshift(prop);
                        break;
                    case 'Villa':
                        this.villas.unshift(prop);
                        break;
                }
            }
        });
    }

    sortProperties(properties: Property[]) {
        this.apartments = properties.filter(prop => prop.category === 'Apartment');
        this.villas = properties.filter(prop => prop.category === 'Villa');
        this.townhouses = properties.filter(prop => prop.category === 'Townhouse');
        this.commercials = properties.filter(prop => prop.category === 'Commercial');
    }
}