import { Component, OnInit, Optional } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ResetPasswordService } from './reset-password.service';

@Component({
    selector: 'reset-password',
    templateUrl: 'reset-password.component.html'
})

export class ResetPasswordComponent implements OnInit {
    currentPwd: string = '';
    newPwd: string = '';
    newPwdConfirm: string = '';

    constructor(
        private resetPassword: ResetPasswordService,
        @Optional() private dialogRef: MatDialogRef<ResetPasswordComponent>
    ) { }

    ngOnInit() { }

    async onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }

        const result = await this.resetPassword.resetPassword(this.currentPwd, this.newPwd);
        if(result){
            this.dialogRef.close();
        }
    }
}