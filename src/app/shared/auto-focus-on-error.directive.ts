import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';

@Directive({
    selector: '[appAutoFocusOnError]'
})
export class AutoFocusDirective {
    constructor(private el: ElementRef) { }

    @Input() formToFocus!: FormGroup;

    @HostListener('submit', ['$event'])
    public onSubmit(event: any): void {
        event.preventDefault();
        this.focus();
    }

    focus() {
        if ('INVALID' === this.formToFocus.status) {
            const formGroupInvalid = this.el.nativeElement.querySelectorAll('.ng-invalid');
            (formGroupInvalid[0] as HTMLElement).scrollIntoView({ block: 'center' });
        }
    }
}