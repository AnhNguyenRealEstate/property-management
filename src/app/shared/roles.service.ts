import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/login.service';
import { FirestoreCollections } from './globals';

@Injectable({ providedIn: 'root' })
export class RolesService {

    private roles$$ = new BehaviorSubject<Role[]>([]);
    roles$ = this.roles$$.asObservable();

    constructor(
        private router: Router,
        private login: LoginService,
        private auth: Auth,
        private firestore: Firestore
    ) {
        this.login.loggedIn$.subscribe(async (loggedIn) => {
            if (loggedIn && this.auth.currentUser?.email) {
                this.roles$$.next(await this.getRoles(this.auth.currentUser?.email));
            } else {
                this.roles$$.next([]);
            }
        });
    }

    private async getRoles(userId: string): Promise<Role[]> {
        if (!userId) {
            return [];
        }

        const userProfileDoc = await getDoc(doc(collection(this.firestore, FirestoreCollections.users), userId));
        const profile = userProfileDoc.data() as UserProfile;

        if (!profile) {
            return [];
        }

        return profile.roles;
    }
}

export interface UserProfile {
    roles: Role[]
}

export type Role = 'owner' | 'customer-service';