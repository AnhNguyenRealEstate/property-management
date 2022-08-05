import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements OnInit {
    constructor(
        private login: LoginService,
        private router: Router
    ) {
        this.login.loggedIn$.subscribe(loggedIn => {
            if (loggedIn) {
                this.router.navigateByUrl('/property-management')
            }
        })
    }

    ngOnInit() {

    }
}