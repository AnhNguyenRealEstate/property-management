import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { RolesService } from 'src/app/shared/roles.service';
import { Activity } from "../activities-view/activity.data";
import { Property } from "./property-card.data";
import { PropertyEditComponent } from '../property-edit/property-edit.component';
import { PropertyCardService } from './property-card.service';

@Component({
    selector: 'property-card',
    templateUrl: 'property-card.component.html',
    styleUrls: ['./property-card.component.scss']
})

export class PropertyCardComponent implements OnInit {
    @Input() property!: Property;
    @Output() delete = new EventEmitter();

    mostRecentActivity: Activity | undefined;

    @ViewChild('confirmationDialog') confirmationDialogTemplate!: TemplateRef<string>;

    constructor(
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private translate: TranslateService,
        private propertyCard: PropertyCardService,
        public roles: RolesService
    ) { }

    async ngOnInit() {
        this.mostRecentActivity = await this.propertyCard.getMostRecentActivity(this.property);
    }

    async editProperty(event: Event) {
        event.stopPropagation();

        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: this.property,
                isEditMode: true
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyEditComponent, config);
    }

    async deleteProperty(event: Event) {
        event.stopPropagation();

        this.dialog.open(this.confirmationDialogTemplate, {
            height: '20%',
            width: '100%'
        }).afterClosed().subscribe((toDelete: boolean) => {
            if (toDelete) {
                this.propertyCard.deleteProperty(this.property);
                this.delete.emit();

                this.snackbar.open(
                    this.translate.instant('property_card.delete_msg'),
                    this.translate.instant('property_card.dismiss_msg'),
                    {
                        duration: 3000
                    }
                );
            }
        });
    }

    async addActivity(activityAddedEvent: any) {
        const activity: Activity = activityAddedEvent.activity;
        const newFiles: File[] = activityAddedEvent.newFiles;

        activity.propertyName = this.property.name;
        activity.propertyId = this.property.id;

        await this.propertyCard.addActivity(this.property, activity, newFiles);

        this.snackbar.open(
            this.translate.instant('property_card.activity_added'),
            this.translate.instant('property_card.dismiss_msg'),
            {
                duration: 3000
            }
        )

        const newActivityIsMostRecent = !this.mostRecentActivity?.date
            || (this.mostRecentActivity?.date?.toDate() < activity.date?.toDate()!);
        if (newActivityIsMostRecent) {
            this.mostRecentActivity = activity;
        }
    }

    timestampToDate(stamp: any): Date {
        return new Date((stamp as any).seconds * 1000);
    }
}