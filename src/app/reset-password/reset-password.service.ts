import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { lastValueFrom } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable({ providedIn: 'root' })
export class ResetPasswordService {
    constructor(
        private auth: Auth,
        private login: LoginService
    ) { }

    async resetPassword(currentPassword: string, newPassword: string): Promise<boolean> {
        if (!this.auth.currentUser?.email) {
            return false;
        }

        const credential = EmailAuthProvider.credential(this.auth.currentUser.email, currentPassword);
        const reauth = await reauthenticateWithCredential(this.auth.currentUser, credential);
        if (!reauth.user?.email) {
            return false;
        }

        await updatePassword(this.auth.currentUser, newPassword);
        return true;
    }
}