import { Component, Input, OnInit } from '@angular/core';
import { Owner } from "../owner.data";

@Component({
    selector: 'owner-list',
    templateUrl: './owner-list.component.html',
    styleUrls: ['./owner-list.component.scss']
})

export class OwnerListComponent implements OnInit {
    @Input() owners!: Owner[];

    constructor(
    ) { }

    ngOnInit() { }

    removeOwner(owner: Owner) {
        const index = this.owners.findIndex(ownerToFind => ownerToFind.username === owner.username);
        this.owners.splice(index, 1);
    }
}