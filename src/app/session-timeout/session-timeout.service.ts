import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login/login.service';
import { TimeoutComponent } from './session-timeout.component';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
    showTimeoutWarning: boolean = false;

    constructor(private idle: Idle,
        private keepalive: Keepalive,
        private router: Router,
        private auth: Auth,
        private routeGuardService: LoginService,
        private dialog: MatDialog) { }

    setTimeout() {
        if (environment.production) {
            this.idle.setIdle(600);
            this.idle.setTimeout(300);
        } else {
            this.idle.setIdle(3600);
            this.idle.setTimeout(300);
        }

        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => {
            this.idle.watch();
            this.showTimeoutWarning = false;
        });

        this.idle.onTimeout.subscribe(() => {
            this.auth.signOut();
            this.router.navigate(['/']);
        });

        this.idle.onTimeoutWarning.pipe(filter(() => !this.showTimeoutWarning)).subscribe(() => {
            const config = {
                height: 'auto',
                width: '90%'
            } as MatDialogConfig;
            this.dialog.open(TimeoutComponent, config);
            this.showTimeoutWarning = true;
        });

        // sets the ping interval to 15 seconds
        this.keepalive.interval(15);

        this.routeGuardService.loggedIn$.subscribe(userLoggedIn => {
            if (userLoggedIn) {
                this.idle.watch();
                this.showTimeoutWarning = false;
            } else {
                this.idle.stop();
                this.showTimeoutWarning = false;
            }
        });
    }
}