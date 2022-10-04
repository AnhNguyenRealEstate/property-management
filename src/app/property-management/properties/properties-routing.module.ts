import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertiesViewComponent } from './properties-view/properties-view.component';

const routes: Routes = [
    {
        path: '',
        component: PropertiesViewComponent
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
export class PropertiesRoutingModule { }