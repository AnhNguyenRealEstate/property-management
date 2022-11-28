import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from '../../login/login.service';
import { FirestoreCollections } from '../../shared/globals';
import { Role, UserProfile } from './users.data';

@Injectable({ providedIn: 'root' })
export class UserProfileService {

    private roles$$ = new BehaviorSubject<Role[]>([]);
    roles$ = this.roles$$.asObservable();

    profile$$ = new BehaviorSubject<UserProfile>({} as UserProfile);
    profile$ = this.profile$$.asObservable();

    constructor(
        private login: LoginService,
        private auth: Auth,
        private firestore: Firestore
    ) {
        this.login.loggedIn$.subscribe(async (loggedIn) => {
            if (loggedIn && this.auth.currentUser?.email) {
                await this.getProfile(this.auth.currentUser?.email);
            } else {
                this.roles$$.next([]);
                this.profile$$.next({} as UserProfile);
            }
        });
    }

    private async getProfile(userId: string) {
        if (!userId) {
            return;
        }

        const userProfileDoc = await getDoc(doc(collection(this.firestore, FirestoreCollections.users), userId));
        const profile = userProfileDoc.data() as UserProfile;

        if (!profile) {
            return;
        }

        this.profile$$.next(profile);
        this.roles$$.next(profile.roles);
    }
}

