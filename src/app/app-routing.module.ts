import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard'
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    data: {
      title: 'app_title'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'app_title'
    }
  },
  {
    path: 'property-management',
    loadChildren: () => import('./property-management/property-management.module').then(mod => mod.PropertyManagementModule),
    canActivate: [AuthGuard],
    data: {
      title: 'layout.property_management',
      authGuardPipe: () => redirectUnauthorizedTo(['/'])
    }
  },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
