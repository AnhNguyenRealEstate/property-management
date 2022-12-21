import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { filter } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { TimeoutComponent } from './session-timeout.component';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
    showTimeoutWarning: boolean = false;
    private IDLE_TIME = 3600;
    private TIMEOUT = 300;

    constructor(private idle: Idle,
        private keepalive: Keepalive,
        private router: Router,
        private auth: Auth,
        private routeGuardService: LoginService,
        private dialog: MatDialog) { }

    setTimeout() {
        this.idle.setIdle(this.IDLE_TIME);

        this.idle.setTimeout(this.TIMEOUT);

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
            userLoggedIn ? this.idle.watch() : this.idle.stop();
            this.showTimeoutWarning = false;
        });
    }
}