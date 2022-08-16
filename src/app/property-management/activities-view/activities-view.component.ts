import { Component, OnDestroy, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { RolesService } from 'src/app/shared/roles.service';
import { Activity } from "./activity.data";
import { ActivitiesViewService } from './activities-view.service';

@Component({
    selector: 'activities-view',
    templateUrl: 'activities-view.component.html',
    styleUrls: ['./activities-view.component.scss']
})

export class ActivitiesViewComponent implements OnInit, OnDestroy {
    activities: Activity[] = [];
    subs: Subscription = new Subscription();
    view: 'list' | 'calendar' = 'calendar';

    constructor(
        public activitiesView: ActivitiesViewService,
        private auth: Auth,
        private roles: RolesService
    ) { }

    async ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(async roles => {
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
}