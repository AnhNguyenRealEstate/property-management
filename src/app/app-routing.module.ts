import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    data: {
      title: 'app_title'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
