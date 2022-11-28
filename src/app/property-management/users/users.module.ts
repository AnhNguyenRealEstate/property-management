import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import { UsersViewComponent } from './users-view/users-view.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        UsersRoutingModule,
        TranslateModule.forChild({ extend: true }),
        MatExpansionModule
    ],
    exports: [UsersViewComponent],
    declarations: [UsersViewComponent],
    providers: [],
})
export class UsersModule { }
