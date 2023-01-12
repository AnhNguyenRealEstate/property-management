import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { UserProfileService } from 'src/app/property-management/users/users.service';
import { Activity } from "../activity.data";
import { ActivitiesViewService } from './activities-view.service';
import { Role } from '../../users/users.data';

@Component({
    selector: 'activities-view',
    templateUrl: 'activities-view.component.html',
    styleUrls: ['./activities-view.component.scss']
})

export class ActivitiesViewComponent implements OnInit, OnDestroy {
    activities: Activity[] = [];
    subs: Subscription = new Subscription();
    view: 'list' | 'calendar' = 'calendar';
    currentRoles: Role[] = [];

    constructor(
        public activitiesView: ActivitiesViewService,
        private auth: Auth,
        public roles: UserProfileService
    ) { }

    async ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
            this.currentRoles = roles;
            if (roles.includes('customer-service')) {
                const snapshot = await this.activitiesView.getActivities();
                this.activities = snapshot.docs.map(doc => doc.data() as Activity);
            } else if (roles.includes('owner') && this.auth.currentUser?.email) {
                const snapshot = await this.activitiesView.getActivities(this.auth.currentUser.email);
                this.activities = snapshot.docs.map(doc => doc.data() as Activity);
            }
        }));
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    async getMoreActivities() {
        if (this.currentRoles.includes('customer-service')) {
            const snapshot = await this.activitiesView.getMoreActivities();
            const newActivities = snapshot.docs.map(doc => doc.data() as Activity)
            this.activities.push(...newActivities);
        } else if (this.currentRoles.includes('owner') && this.auth.currentUser?.email) {
            const snapshot = await this.activitiesView.getMoreActivities(this.auth.currentUser.email);
            const newActivities = snapshot.docs.map(doc => doc.data() as Activity)
            this.activities.push(...newActivities);
        }
    }
}