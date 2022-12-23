import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { OwnerUploadComponent } from '../owner-upload/owner-upload.component';
import { Owner } from "../owner.data";
import { OwnersViewService } from './owners-view.service';

@Component({
    selector: 'owners-view',
    templateUrl: './owners-view.component.html',
    styleUrls: ['./owners-view.component.scss']
})

export class OwnersViewComponent implements OnInit {
    owners!: Owner[];
    algoliaQuery = '';

    constructor(
        public ownersView: OwnersViewService,
        private dialog: MatDialog
    ) {
    }

    async ngOnInit() {
        this.owners = await this.ownersView.getOwners();
    }

    async searchWithAlgolia() {
        this.owners = (await this.ownersView.getOwners())
            .filter(owner => owner.contactName?.toLowerCase().includes(this.algoliaQuery.toLowerCase().trim()));
    }

    registerOwner() {
        const config = {
            height: '90%',
            width: '100%',
            autoFocus: false,
            data: {
                owner: {} as Owner,
                isEditMode: false
            }
        } as MatDialogConfig;

        this.dialog.open(OwnerUploadComponent, config);
    }
}