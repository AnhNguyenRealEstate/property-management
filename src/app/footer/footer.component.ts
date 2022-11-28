import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.component.html',
    styleUrls: ['./footer.component.scss']
})

export class FooterComponent {
    year = (new Date()).getFullYear()
    
    constructor() { }
}