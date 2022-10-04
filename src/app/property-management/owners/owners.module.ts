import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OwnerListModule } from './owner-list/owner-list.module';
import { OwnerUploadModule } from './owner-upload/owner-upload.module';

import { OwnersViewComponent } from './owners-view/owners-view.component';

@NgModule({
    declarations: [OwnersViewComponent],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule.forChild({ extend: true }),
        OwnerListModule,
        OwnerUploadModule
    ],
    exports: [OwnersViewComponent],
})
export class OwnersViewModule { }
