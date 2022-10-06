import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'label-span',
    templateUrl: './label-span.component.html'
})

export class LabelSpanComponent implements OnInit {
    @Input() label: string | undefined | null
    @Input() span: string | undefined | null

    constructor() { }

    ngOnInit() { }
}