import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { RTEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PropertyUploadComponent } from './property-upload.component';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { ActivityListModule } from '../activity-list/activity-list.module';

@NgModule({
    declarations: [PropertyUploadComponent],
    imports: [
        CommonModule,
        RTEditorModule,
        SharedModule,
        TranslateModule.forChild({
            extend: true
        }),
        NgxMaskModule.forChild(),
        DragDropModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ActivityListModule
    ],
    exports: [PropertyUploadComponent],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }]
})
export class PropertyUploadModule {
}
