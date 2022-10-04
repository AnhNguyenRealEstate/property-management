import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesViewComponent } from './activities-view/activities-view.component';

const routes: Routes = [
    {
        path: '',
        component: ActivitiesViewComponent
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
export class ActivitiesRoutingModule { }