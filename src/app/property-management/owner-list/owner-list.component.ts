import { Component, Input, OnInit } from '@angular/core';
import { Owner } from '../property-management.data';

@Component({
    selector: 'owner-list',
    templateUrl: './owner-list.component.html',
    styleUrls: ['./owner-list.component.scss']
})

export class OwnerListComponent implements OnInit {
    @Input() owners!: Owner[];

    constructor() { }

    ngOnInit() { }
}