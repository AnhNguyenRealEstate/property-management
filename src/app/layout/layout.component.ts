import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RolesService } from 'src/app/shared/roles.service';
import { LoginComponent } from '../login/login.component';
import { LoginService } from '../login/login.service';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
    selector: 'app-layout',
    templateUrl: 'layout.component.html',
    styleUrls: ['./layout.component.scss']
})

export class LayoutComponent implements OnInit, OnDestroy {
    loggedIn: boolean = false;
    lang!: string;
    sub = new Subscription();
    highlightSideNavBtnSub: Subscription | undefined;

    constructor(
        private router: Router,
        public auth: Auth,
        private loginService: LoginService,
        public roles: RolesService,
        private dialog: MatDialog,
        public translate: TranslateService,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document) {

        this.sub.add(this.loginService.loggedIn$.subscribe(loggedIn => {
            this.loggedIn = loggedIn;

            if (this.loggedIn) {
                this.highlightSideNavBtnSub = this.router.events.subscribe(event => {
                    if (event instanceof NavigationEnd) {
                        this.highlightSideNavBtn(event.url);
                    }
                });
                this.sub.add(this.highlightSideNavBtnSub);
            }
        }));
    }

    ngOnInit(): void {
        const sessionLang = localStorage.getItem('lang');
        this.lang = sessionLang || this.translate.getDefaultLang();
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    useLanguage(event: any) {
        this.translate.use(this.lang);
        localStorage.setItem('lang', this.lang);
    }

    logout() {
        this.highlightSideNavBtnSub?.unsubscribe();
        
        this.auth.signOut().then(() => {
            this.router.navigateByUrl('');
        });
    }

    resetPwd() {
        this.dialog.open(ResetPasswordComponent)
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

    highlightSideNavBtn(url: string) {
        if (url.includes('property-management-outlet:properties')) {
            this.raiseViewBtn(this.document.querySelector('a[id="properties-btn"]'))
        } else if (url.includes('property-management-outlet:activities')) {
            this.raiseViewBtn(this.document.querySelector('a[id="activities-btn"]'))
        } else if (url.includes('property-management-outlet:invoices')) {
            this.raiseViewBtn(this.document.querySelector('a[id="invoices-btn"]'))
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