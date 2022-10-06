import { AfterViewChecked, AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { RolesService } from '../shared/roles.service';
import { LoginService } from '../login/login.service';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContractExtractionComponent } from './contract-extraction/contract-extraction.component';
import { Property } from './properties/property.data';
import { PropertyEditComponent } from './properties/property-edit/property-edit.component';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'property-management',
    templateUrl: 'property-management.component.html',
    styleUrls: ['./property-management.component.scss']
})

export class PropertyManagementComponent implements OnInit, AfterViewInit, OnDestroy {
    isDesktop: boolean = true;
    subs: Subscription = new Subscription();

    constructor(
        private dialog: MatDialog,
        public roles: RolesService,
        private router: Router,
        private login: LoginService,
        private renderer: Renderer2,
        private activatedRoute: ActivatedRoute,
        @Inject(DOCUMENT) private document: Document
    ) {
    }

    ngOnInit(): void {
        const width = this.document.defaultView ? this.document.defaultView.innerWidth : 0;
        const mobileDevicesWidth = 600;
        this.isDesktop = width > mobileDevicesWidth;

        this.subs.add(this.login.loggedIn$.subscribe(loggedIn => {
            if (!loggedIn) {
                this.router.navigateByUrl('/');
            }
        }));

        this.subs.add(this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.highlightSideNavBtn(event.url);
            }
        }))
    }

    ngAfterViewInit(): void {
        this.highlightSideNavBtn(this.router.url);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // viewSummary() {
    //     this.router.navigateByUrl('/property-management/(property-management-outlet:summary)');
    // }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }

    viewInvoices() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:invoices)');
    }

    // viewOwners() {
    //     this.router.navigateByUrl('/property-management/(property-management-outlet:owners)');
    // }

    changeView(event: number) {
        if (event == 0) {
            this.viewProperties();
        } else if (event == 1) {
            this.viewActivities();
        }
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

    async extractContract() {
        const config = {
            height: '95%',
            width: '100%',
            autoFocus: false
        } as MatDialogConfig;

        this.dialog.open(ContractExtractionComponent, config);
    }

    highlightSideNavBtn(url: string) {
        if (url.includes('property-management-outlet:properties')) {
            this.raiseViewBtn(this.document.querySelector('button[id="properties-btn"]'))
        } else if (url.includes('property-management-outlet:activities')) {
            this.raiseViewBtn(this.document.querySelector('button[id="activities-btn"]'))
        } else if (url.includes('property-management-outlet:invoices')) {
            this.raiseViewBtn(this.document.querySelector('button[id="invoices-btn"]'))
        } else {
            this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
        }
    }
    raiseViewBtn(target: any) {
        const classList = target.classList as DOMTokenList;
        if (classList.contains('view-nav-btn')) {
            this.document.querySelectorAll('.view-nav-btn').forEach(element => {
                this.renderer.removeClass(element, 'active-nav-btn');
            });

            this.renderer.addClass(target, 'active-nav-btn');
        } else if ((target.offsetParent.classList as DOMTokenList).contains('view-nav-btn')) {
            parent = target.offsetParent;
            this.document.querySelectorAll('.view-nav-btn').forEach(element => {
                this.renderer.removeClass(element, 'active-nav-btn');
            });

            this.renderer.addClass(parent, 'active-nav-btn');
        }
    }
}