import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // login (auth module)
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/auth-routing.module').then((m) => m.AuthRoutingModule),
  },

  // dashboard (after login)
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard-routing.module').then(
        (m) => m.DashboardRoutingModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
