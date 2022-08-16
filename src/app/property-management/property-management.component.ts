import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RolesService } from '../shared/roles.service';
import { Property } from "./property-card/property.data";
import { PropertyUploadComponent } from './property-upload/property-upload.component';
import { LoginService } from '../login/login.service';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'property-management',
    templateUrl: 'property-management.component.html',
    styleUrls: ['./property-management.component.scss']
})

export class PropertyManagementComponent implements OnInit, OnDestroy {
    isDesktop: boolean = true;
    subs: Subscription = new Subscription();

    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        private router: Router,
        private login: LoginService,
        @Inject(DOCUMENT) private document: Document
    ) {
    }

    ngOnInit(): void {
        const width = this.document.defaultView ? this.document.defaultView.innerWidth : 0;
        const mobileDevicesWidth = 600;
        this.isDesktop = width > mobileDevicesWidth;

        this.subs.add(this.login.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl('/property-management/(property-management-outlet:properties-view)');
            }
            else {
                this.router.navigateByUrl('/');
            }
        }));
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
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