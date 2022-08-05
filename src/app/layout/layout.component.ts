import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RolesService } from 'src/app/shared/roles.service';
import { LoginComponent } from '../login/login.component';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'app-layout',
    templateUrl: 'layout.component.html',
    styleUrls: ['./layout.component.scss']
})

export class LayoutComponent implements OnInit, OnDestroy {
    loggedIn: boolean = false;
    lang!: string;
    sub = new Subscription();

    constructor(
        private router: Router,
        public auth: Auth,
        private loginService: LoginService,
        public roles: RolesService,
        private dialog: MatDialog,
        public translate: TranslateService) {
        this.sub.add(this.loginService.loggedIn$.subscribe(loggedIn => this.loggedIn = loggedIn));
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
}