import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { OwnerListComponent } from './owner-list.component';
import { OwnerListItemComponent } from './owner-list-item/owner-list-item.component';

@NgModule({
    declarations: [
        OwnerListComponent,
        OwnerListItemComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        MatExpansionModule,
        TranslateModule.forChild(
            { extend: true }
        )
    ],
    exports: [OwnerListComponent]
})
export class OwnerListModule { }
