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
                path: '',
                redirectTo: 'summary',
                pathMatch: 'full'
            },
            {
                path: 'summary',
                loadChildren: () => import('./summary/summary.module').then(mod => mod.SummaryModule)
            },
            {
                path: 'owners',
                loadChildren: () => import('./owners/owners.module').then(mod => mod.OwnersViewModule)
            },
            {
                path: 'properties',
                loadChildren: () => import('./properties/properties.module').then(mod => mod.PropertiesViewModule)
            },
            {
                path: 'activities',
                loadChildren: () => import('./activities/activities.module').then(mod => mod.ActivitiesModule)
            },
            {
                path: 'invoices',
                loadChildren: () => import('./invoices/invoices.module').then(mod => mod.InvoicesViewModule)
            },
            {
                path: 'users',
                loadChildren: () => import('./users/users.module').then(mod => mod.UsersModule)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PropertyManagementRoutingModule { }