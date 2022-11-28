import { Injector, NgModule } from '@angular/core';
import { Route, RouterModule, Routes, UrlSegment } from '@angular/router';
import { PropertyManagementComponent } from './property-management.component';
import { UserProfileService } from 'src/app//property-management/users/users.service'

const routes: Routes = [
    {
        path: '',
        component: PropertyManagementComponent,
        children: [
            {
                path: 'summary',
                loadChildren: () => import('./summary/summary.module').then(mod => mod.SummaryModule),
                outlet: 'property-management-outlet'
            },
            {
                path: 'owners',
                loadChildren: () => import('./owners/owners.module').then(mod => mod.OwnersViewModule),
                outlet: 'property-management-outlet'
            },
            {
                path: 'properties',
                loadChildren: () => import('./properties/properties.module').then(mod => mod.PropertiesViewModule),
                outlet: 'property-management-outlet'
            },
            {
                path: 'activities',
                loadChildren: () => import('./activities/activities.module').then(mod => mod.ActivitiesModule),
                outlet: 'property-management-outlet'
            },
            {
                path: 'invoices',
                loadChildren: () => import('./invoices/invoices.module').then(mod => mod.InvoicesViewModule),
                outlet: 'property-management-outlet'
            },
            {
                path: 'users',
                loadChildren: () => import('./users/users.module').then(mod => mod.UsersModule),
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