import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Update the path below if your login.component.ts is located elsewhere

import { LoginComponent } from './login/login.component';


const routes: Routes = [{ path: '', component: LoginComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
