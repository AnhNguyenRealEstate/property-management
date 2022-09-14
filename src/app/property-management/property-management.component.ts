import { Component, HostListener, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RolesService } from '../shared/roles.service';
import { LoginService } from '../login/login.service';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContractExtractionComponent } from './contract-extraction/contract-extraction.component';
import { Property } from './properties/property-card/property-card.data';
import { PropertyEditComponent } from './properties/property-edit/property-edit.component';

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
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document
    ) {
    }

    ngOnInit(): void {
        const width = this.document.defaultView ? this.document.defaultView.innerWidth : 0;
        const mobileDevicesWidth = 600;
        this.isDesktop = width > mobileDevicesWidth;

        this.subs.add(this.login.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
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
        this.router.navigateByUrl('/property-management/(property-management-outlet:summary)');
    }

    viewProperties() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:properties)');
    }

    viewActivities() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:activities)');
    }

    viewOwners() {
        this.router.navigateByUrl('/property-management/(property-management-outlet:owners)');
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

    @HostListener('click', ['$event.target'])
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