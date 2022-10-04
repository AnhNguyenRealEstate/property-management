import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryViewComponent } from './summary-view/summary-view.component';

const routes: Routes = [
    {
        path: '',
        component: SummaryViewComponent
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
export class SummaryViewRoutingModule { }