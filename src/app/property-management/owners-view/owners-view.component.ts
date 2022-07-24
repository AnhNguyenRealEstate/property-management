import { Component, OnInit } from '@angular/core';
import { Owner } from '../property-management.data';
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
        private ownersView: OwnersViewService
    ) {
    }

    async ngOnInit() {
        this.owners = await this.ownersView.getOwners();
    }

    async searchWithAlgolia() {
        this.owners = (await this.ownersView.getOwners())
            .filter(owner => owner.contactName?.toLowerCase().includes(this.algoliaQuery.toLowerCase().trim()));
    }
}