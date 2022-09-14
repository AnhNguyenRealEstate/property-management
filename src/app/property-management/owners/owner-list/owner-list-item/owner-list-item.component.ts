import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Property } from 'src/app/property-management/properties/property-card/property-card.data';
import { PropertyDetailsComponent } from 'src/app/property-management/properties/property-details/property-details.component';
import { RolesService } from 'src/app/shared/roles.service';
import { OwnerUploadComponent } from '../../owner-upload/owner-upload.component';
import { Owner } from "../../owners-view/owner.data";
import { OwnerListItemService } from './owner-list-item.service';

@Component({
    selector: 'owner-listing-item',
    templateUrl: './owner-list-item.component.html',
    styleUrls: ['./owner-list-item.component.scss']
})

export class OwnerListItemComponent implements OnInit, OnDestroy {
    @Input() owner!: Owner;
    @Output() ownerDeleted: EventEmitter<void> = new EventEmitter<void>();

    properties: Property[] = [];

    canRemoveOwner: boolean = false;
    canEditOwner: boolean = false;

    subs: Subscription = new Subscription();

    @ViewChild('deleteConfirmation') confirmationDialogTemplate!: TemplateRef<string>;

    constructor(
        public ownerListItem: OwnerListItemService,
        private roles: RolesService,
        private renderer: Renderer2,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private translate: TranslateService
    ) { }

    ngOnInit() {
        this.subs.add(this.roles.roles$.subscribe(roles => {
            if (roles.includes('customer-service')) {
                this.canRemoveOwner = true;
                this.canEditOwner = true;
            }
        }));
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    async getProperties(owner: Owner) {
        if (!owner.username) {
            return;
        }

        if (this.properties.length) {
            return;
        }

        this.properties = await this.ownerListItem.getPropertiesFrom(owner.username);
    }

    async deleteOwner(owner: Owner) {
        this.dialog.open(this.confirmationDialogTemplate, {
            height: '20%',
            width: '100%'
        }).afterClosed().subscribe(async (toDelete: boolean) => {
            if (toDelete) {
                await this.ownerListItem.deleteOwner(owner);
                this.ownerDeleted.emit();

                this.snackbar.open(
                    this.translate.instant('owner_list_item.delete_msg'),
                    this.translate.instant('owner_list_item.dismiss_msg'),
                    {
                        duration: 3000
                    }
                );
            }
        });
    }

    async editOwner(owner: Owner) {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                owner: this.owner,
                isEditMode: true
            }
        } as MatDialogConfig;

        this.dialog.open(OwnerUploadComponent, config);
    }

    showDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.removeStyle(deleteBtn, 'display');
    }

    showEditBtn(editBtn: HTMLDivElement) {
        this.renderer.removeStyle(editBtn, 'display');
    }

    hideDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.setStyle(deleteBtn, 'display', 'none');
    }

    hideEditBtn(editBtn: HTMLDivElement) {
        this.renderer.setStyle(editBtn, 'display', 'none');
    }

    viewPropertyDetails(property: Property) {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                property: property
            }
        } as MatDialogConfig;

        this.dialog.open(PropertyDetailsComponent, config);
    }
}