import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginService {
    private loggedIn$$ = new BehaviorSubject<boolean>(false);
    loggedIn$ = this.loggedIn$$.asObservable();

    constructor(
        private auth: Auth
    ) {
        this.auth.onAuthStateChanged(user => {
            if (user?.email) {
                this.loggedIn$$.next(true);
            } else {
                this.loggedIn$$.next(false);
            }
        });
    }
}