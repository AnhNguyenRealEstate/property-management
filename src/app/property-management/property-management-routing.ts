import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesViewComponent } from './activities/activities-view/activities-view.component';
import { InvoicesViewComponent } from './invoices/invoices-view/invoices-view.component';
import { OwnersViewComponent } from './owners/owners-view/owners-view.component';
import { PropertiesViewComponent } from './properties/properties-view/properties-view.component';
import { PropertyManagementComponent } from './property-management.component';
import { SummaryViewComponent } from './summary-view/summary-view.component';

const routes: Routes = [
    {
        path: '',
        component: PropertyManagementComponent,
        children: [
            {
                path: 'summary',
                component: SummaryViewComponent,
                outlet: 'property-management-outlet'
            },
            {
                path: 'owners',
                component: OwnersViewComponent,
                outlet: 'property-management-outlet'
            },
            {
                path: 'properties',
                component: PropertiesViewComponent,
                outlet: 'property-management-outlet'
            },
            {
                path: 'activities',
                component: ActivitiesViewComponent,
                outlet: 'property-management-outlet'
            },
            {
                path: 'invoices',
                component: InvoicesViewComponent,
                outlet: 'property-management-outlet'
            }
        ]
    },
    { path: '**', redirectTo: '/property-management' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PropertyManagementRoutingModule { }