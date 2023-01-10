import { Component, OnInit } from '@angular/core';
import { Auth, browserLocalPersistence, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './login.service';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
    summaryPage = '/property-management/(property-management-outlet:summary)';

    userName: string = '';
    password: string = '';
    hide: boolean = true;
    successful: boolean = true;
    inProgress: boolean = false;

    constructor(
        private loginService: LoginService,
        public auth: Auth,
        private translateService: TranslateService,
        private router: Router) { }

    ngOnInit(): void {
        this.loginService.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl(this.summaryPage);
            }
        })
    }

    async login() {
        this.successful = true;
        this.inProgress = true;

        await this.auth.setPersistence(browserLocalPersistence);
        await signInWithEmailAndPassword(this.auth, this.userName, this.password).catch(error => {
            this.successful = false;
            this.inProgress = false;

            const errorCode = error.code;
            const errorMessage = error.message;

            switch (errorCode) {
                case 'auth/wrong-password':
                case 'auth/invalid-email':
                    alert(this.translateService.instant('login.wrong_email_pw'));
                    break;
                default:
                    alert(errorMessage);
            }
        });

        this.inProgress = false;

        if (this.successful) {
            this.router.navigateByUrl(this.summaryPage);
        }
    }
}