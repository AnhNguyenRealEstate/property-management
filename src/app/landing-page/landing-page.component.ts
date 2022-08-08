import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
    animations: [
        trigger('landingAnim', [
            transition(':enter', [
                query('.top-level-intro', style({ opacity: 0.2, transform: 'translateY(40px)' })),
                query('.features-section', style({ opacity: 0.2, transform: 'translateY(40px)' })),
                query('.top-level-intro', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
                query('.features-section', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
            ])
        ])
    ]
})

export class LandingPageComponent implements OnInit, OnDestroy {
    subs: Subscription = new Subscription();

    constructor(
        private login: LoginService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.subs.add(this.login.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl('/property-management')
            }
        }));
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}