import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesViewComponent } from './invoices-view/invoices-view.component';

const routes: Routes = [
    {
        path: '',
        component: InvoicesViewComponent
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
export class InvoicesRoutingModule { }