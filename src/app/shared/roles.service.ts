import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from '../login/login.service';
import { FirestoreCollections } from './globals';

@Injectable({ providedIn: 'root' })
export class RolesService implements CanActivate {

    private roles$$ = new BehaviorSubject<Role[]>([]);
    roles$ = this.roles$$.asObservable();

    constructor(
        private router: Router,
        private login: LoginService,
        private auth: Auth,
        private firestore: Firestore
    ) {
        this.login.loggedIn$.subscribe(async (loggedIn) => {
            if (loggedIn) {
                this.roles$$.next(await this.getRoles(this.auth.currentUser?.email || ''));
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
        return profile.roles;
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (!route.routeConfig?.path) {
            return false;
        }

        if (route.routeConfig?.path.includes('property-management')) {
            const roles = this.roles$$.getValue();
            const canAccessPropMgmt = roles.includes('customer-service') || roles.includes('owner');
            if (!canAccessPropMgmt) {
                this.router.navigate(['/']);
            }
            
            return canAccessPropMgmt;
        }

        return false;
    }
}

export interface UserProfile {
    roles: Role[]
}

export type Role = 'sales' | 'owner' | 'customer-service';