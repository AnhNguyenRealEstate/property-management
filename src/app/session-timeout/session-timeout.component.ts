import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-timeout',
    template: `<h1>{{ 'session_timeout.title' | translate }}</h1>
                <p>{{ 'session_timeout.warning' | translate }}</p>`
})

export class TimeoutComponent {
    constructor() { }
}