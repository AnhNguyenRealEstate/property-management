import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserProfileService } from '../shared/user-profile.service';
import { LoginService } from '../login/login.service';
import { DOCUMENT } from '@angular/common';
import { Property } from './properties/property.data';
import { PropertyEditComponent } from './properties/property-edit/property-edit.component';
import { LayoutService } from '../layout/layout.service';

@Component({
    selector: 'property-management',
    templateUrl: 'property-management.component.html',
    styleUrls: ['./property-management.component.scss']
})

export class PropertyManagementComponent implements OnInit, AfterViewInit {
    isDesktop: boolean = true;

    constructor(
        private dialog: MatDialog,
        public roles: UserProfileService,
        private router: Router,
        private layout: LayoutService,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.layout.init();
    }

    ngOnInit(): void {
        const width = this.document.defaultView ? this.document.defaultView.innerWidth : 0;
        const mobileDevicesWidth = 600;
        this.isDesktop = width > mobileDevicesWidth;
    }

    ngAfterViewInit(): void {
        this.layout.highlightNav();
    }

    viewSummary() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:summary)');
    }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }

    viewInvoices() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:invoices)');
    }

    async addProperty() {
        const config = {
            height: '95%',
            width: '100%',
            autoFocus: false,
            data: {
                property: {} as Property,
                isEditMode: false
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyEditComponent, config);
    }
}