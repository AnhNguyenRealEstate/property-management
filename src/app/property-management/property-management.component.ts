import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService } from '../shared/roles.service';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { Property } from './property-management.data';
import { PropertyManagementService } from './property-management.service';
import { PropertyUploadComponent } from './property-upload/property-upload.component';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'property-management',
    templateUrl: 'property-management.component.html',
    styleUrls: ['./property-management.component.scss']
})

export class PropertyManagementComponent implements OnInit {
    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        private router: Router,
        private login: LoginService) {
    }

    ngOnInit(): void {
        this.login.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl('/property-management/(property-management-outlet:properties-view)');
            }
            else {
                this.router.navigateByUrl('/login');
            }
        })
    }

    viewSummary() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:summary-view)');
    }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties-view)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }

    viewOwners() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:owners)');
    }

    async addProperty() {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: {} as Property,
                isEditMode: false
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyUploadComponent, config);
    }
}