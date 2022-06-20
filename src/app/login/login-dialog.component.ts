import { Component } from '@angular/core';
import { Auth, browserSessionPersistence, signInWithEmailAndPassword } from '@angular/fire/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: 'login-dialog.component.html',
    styleUrls: ['./login-dialog.component.scss']
})

export class LoginComponent {
    userName: string = '';
    password: string = '';
    hide: boolean = true;
    successful: boolean = true;
    inProgress: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<LoginComponent>,
        public auth: Auth,
        private translateService: TranslateService) { }

    async login() {
        this.successful = true;
        this.inProgress = true;

        await this.auth.setPersistence(browserSessionPersistence);
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
            this.dialogRef.close(true);
        }
    }
}