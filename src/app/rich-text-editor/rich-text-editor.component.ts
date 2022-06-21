import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-editor',
    template: `<editor 
                [apiKey]="tinyMCE_API_key" 
                [init]="init" 
                [ngModel]="text"
                (ngModelChange)="textChange.emit($event)">
            </editor>`
})

export class RTEditorComponent {
    @Input() text!: string;
    @Output() textChange = new EventEmitter<string>();

    tinyMCE_API_key = 'ho6mfhwuz7956d5wu24o4k594oyp2gwgs9iqhyuf1drlcwjj';
    init = {
        height: 300,
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
            'undo redo | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | help'
    };
}