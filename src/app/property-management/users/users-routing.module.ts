import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersViewComponent } from './users-view/users-view.component';

const routes: Routes = [
    {
        path: '',
        component: UsersViewComponent
    },
    {
        path: '**',
        redirectTo: '/property-management'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UsersRoutingModule { }