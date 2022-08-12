import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { RolesService } from 'src/app/shared/roles.service';
import { Owner, Property } from '../../property-management.data';
import { OwnerListItemService } from './owner-list-item.service';

@Component({
    selector: 'owner-listing-item',
    templateUrl: './owner-list-item.component.html',
    styleUrls: ['./owner-list-item.component.scss']
})

export class OwnerListItemComponent implements OnInit {
    @Input() owner!: Owner;
    @Output() ownerDeleted: EventEmitter<void> = new EventEmitter<void>();
    properties: Property[] = [];

    canRemoveOwner: boolean = false;

    constructor(
        private ownerListItem: OwnerListItemService,
        private roles: RolesService,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.roles.roles$.subscribe(roles => {
            if (roles.includes('customer-service')) {
                this.canRemoveOwner = true;
            }
        })
    }

    async getProperties(owner: Owner) {
        if (!owner.username) {
            return;
        }

        this.properties = await this.ownerListItem.getPropertiesFrom(owner.username);
    }

    async deleteOwner(owner: Owner) {
        await this.ownerListItem.deleteOwner(owner);
        this.ownerDeleted.emit();
    }

    showDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.removeStyle(deleteBtn, 'display');
    }

    hideDeleteBtn(deleteBtn: HTMLDivElement) {
        this.renderer.setStyle(deleteBtn, 'display', 'none');
    }
}