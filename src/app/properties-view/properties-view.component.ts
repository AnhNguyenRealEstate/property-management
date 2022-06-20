import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RolesService } from 'src/app/shared/roles.service';
import { PropertyDetailsComponent } from '../property-details/property-details.component';
import { Property } from '../property-management.data';
import { PropertyUploadComponent } from '../property-upload/property-upload.component';
import { PropertiesViewService } from './properties-view.service';

@Component({
    selector: 'properties-view',
    templateUrl: 'properties-view.component.html',
    styleUrls: ['./properties-view.component.scss']
})

export class PropertiesViewComponent implements OnInit, OnDestroy {
    properties: Property[] = [];
    subs: Subscription = new Subscription();

    algoliaQuery = '';

    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        private propertiesView: PropertiesViewService,
        private auth: Auth
    ) { }

    async ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
            if (roles.includes('customer-service')) {
                this.properties = await this.propertiesView.getProperties();
            } else if (roles.includes('owner') && this.auth.currentUser?.email) {
                this.properties = await this.propertiesView.getProperties(this.auth.currentUser.email);
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

    propertyRemoved(propToRemove: Property) {
        const index = this.properties.findIndex(property => property.id === propToRemove.id);
        if (index === -1) {
            return;
        }

        this.properties.splice(index, 1);
    }

    async searchWithAlgolia() {
        this.properties = (await this.propertiesView.getProperties())
            .filter(property => property.name?.toLowerCase().includes(this.algoliaQuery.toLowerCase()));
    }
}