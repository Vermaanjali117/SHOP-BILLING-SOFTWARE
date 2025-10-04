import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomerComponent } from './customer/customer.component';

import { LayoutComponent } from './layout/layout.component';
import { BillComponent } from './bill/bill.component';
import { HomeComponent } from './home/home.component';
import { AddnewitemComponent } from './addnewitem/addnewitem.component';
import { SalessummeryComponent } from './salessummery/salessummery.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // contains header + sidebar
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'bill/:id', component: BillComponent },
      { path: 'items', component: AddnewitemComponent },
      { path: 'invoice_list', component: CustomerComponent },
      { path: 'sales_summary', component: SalessummeryComponent },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
