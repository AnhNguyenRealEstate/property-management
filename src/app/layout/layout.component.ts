import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { LoginComponent } from '../login/login.component';
import { LoginService } from '../login/login.service';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { LayoutService } from './layout.service';

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
        public roles: UserProfileService,
        private dialog: MatDialog,
        public translate: TranslateService) {

        this.sub.add(this.loginService.loggedIn$.subscribe(loggedIn => {
            this.loggedIn = loggedIn;
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
        this.auth.signOut().then(() => {
            this.router.navigateByUrl('');
        });
    }

    resetPwd() {
        this.dialog.open(ResetPasswordComponent)
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