import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfileService } from './users/users.service';
import { DOCUMENT } from '@angular/common';
import { LayoutService } from '../layout/layout.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'property-management',
    templateUrl: 'property-management.component.html',
    styleUrls: ['./property-management.component.scss']
})

export class PropertyManagementComponent implements OnInit, AfterViewInit, OnDestroy {
    isDesktop: boolean = true;

    constructor(
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

    ngOnDestroy(): void {
        this.layout.ngOnDestroy();
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

    viewUsers() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:users)');
    }
}