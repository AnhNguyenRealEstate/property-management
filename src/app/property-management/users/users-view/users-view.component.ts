import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserProfile } from '../users.data';
import { UserProfileService } from '../users.service';
import { UsersViewService } from './users-view.service';

@Component({
    selector: 'users-view',
    templateUrl: 'users-view.component.html',
    styleUrls: ['./users-view.component.scss']
})

export class UsersViewComponent implements OnInit {
    users: UserProfile[] = []

    @ViewChild('userUploadTpl') userUploadTpl!: TemplateRef<string>;
    @ViewChild('deleteConfirmationTpl') deleteConfirmationTpl!: TemplateRef<string>;

    constructor(
        private userProfile: UserProfileService,
        private usersView: UsersViewService,
        private renderer: Renderer2,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private translate: TranslateService,
        private router: Router
    ) {
    }

    async ngOnInit() {
        this.userProfile.roles$.subscribe(roles => {
            if (!roles.includes('admin')) {
                this.router.navigateByUrl('/property-management/(property-management-outlet:summary)')
            }
        })

        this.users = await this.usersView.getUserProfiles()
    }

    showActions(...btns: HTMLDivElement[]) {
        btns.forEach(btn => {
            this.renderer.removeStyle(btn, 'display')
        })
    }

    hideActions(...btns: HTMLDivElement[]) {
        btns.forEach(btn => {
            this.renderer.setStyle(btn, 'display', 'none')
        })
    }

    editUser(user: UserProfile) {
        const config = {
            height: 'fit-content',
            width: '60%',
            data: {
                user: { ...user },
                isEdit: true
            }
        } as MatDialogConfig

        this.dialog.open(this.userUploadTpl, config).afterClosed().subscribe(async (data) => {
            if (!data?.saveEdit) {
                return
            }

            await this.usersView.updateUser({
                displayName: data.user.displayName,
                userName: data.user.userName
            } as UserProfile)

            this.snackbar.open(
                this.translate.instant('users_view.edit_success'),
                this.translate.instant('users_view.dismiss'),
                {
                    duration: 3000
                }
            )
        })
    }

    createUser() {
        const config = {
            height: 'fit-content',
            width: '60%',
            data: {
                user: {}
            }
        } as MatDialogConfig

        this.dialog.open(this.userUploadTpl, config).afterClosed().subscribe(async (data) => {
            if (!data?.addUser) {
                return
            }

            await this.usersView.createUser(
                {
                    displayName: data.user.displayName,
                    userName: data.user.userName,
                    roles: [
                        'customer-service'
                    ]
                } as UserProfile
            )

            this.snackbar.open(
                this.translate.instant('users_view.creation_success'),
                this.translate.instant('users_view.dismiss'),
                {
                    duration: 3000
                }
            )

            this.ngOnInit();
        })
    }

    async deleteUser(user: UserProfile) {
        const config = {
            height: 'fit-content',
            width: '60%',
            data: {
                displayName: user.displayName
            }
        } as MatDialogConfig

        this.dialog.open(this.deleteConfirmationTpl, config).afterClosed().subscribe(async (toDelete) => {
            if (toDelete) {
                await this.usersView.deleteUser(user)
                this.users = this.users.filter(_ => _.userName !== user.userName)

                this.snackbar.open(
                    this.translate.instant('users_view.user_deleted'),
                    this.translate.instant('users_view.dismiss'),
                    {
                        duration: 3000
                    }
                )
            }
        })
    }
}