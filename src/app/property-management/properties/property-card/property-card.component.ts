import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { RolesService } from 'src/app/shared/roles.service';
import { Property } from "../property.data";
import { PropertyEditComponent } from '../property-edit/property-edit.component';
import { PropertyCardService } from './property-card.service';
import { Activity } from '../../activities/activity.data';

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

    propertyNoLongerManaged: boolean = false;
    contractProgress: number = 0;

    constructor(
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private translate: TranslateService,
        private propertyCard: PropertyCardService,
        public roles: RolesService
    ) { }

    async ngOnInit() {
        this.mostRecentActivity = await this.propertyCard.getMostRecentActivity(this.property);
        this.propertyNoLongerManaged = this.property.managementEndDate?.toDate()! < new Date();
        this.calculateContractProgress();
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

    timestampToDate(stamp: any): Date {
        return new Date((stamp as any).seconds * 1000);
    }

    calculateContractProgress() {
        const startDate = this.property.managementStartDate!;
        const endDate = this.property.managementEndDate!;
        const today = Timestamp.fromDate(new Date());

        const total = endDate.seconds - startDate.seconds;
        const progressSoFar = today.seconds - startDate.seconds;

        this.contractProgress = Math.floor((progressSoFar / total) * 100);
    }
}