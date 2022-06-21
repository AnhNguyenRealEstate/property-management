import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';

import { RTEditorComponent } from './rich-text-editor.component';

@NgModule({
    imports: [CommonModule, FormsModule, EditorModule],
    declarations: [RTEditorComponent],
    exports: [RTEditorComponent]
})
export class RTEditorModule { }
