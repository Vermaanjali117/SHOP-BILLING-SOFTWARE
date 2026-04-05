import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomerComponent } from './customer/customer.component';

import { LayoutComponent } from './layout/layout.component';
import { BillComponent } from './bill/bill.component';
import { CartComponent } from './cart/cart.component';
import { HomeComponent } from './home/home.component';
import { AddnewitemComponent } from './addnewitem/addnewitem.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { SalessummeryComponent } from './salessummery/salessummery.component';
import { RowMaterialComponent } from './row-material/row-material.component';
import { AnalyzePerformanceComponent } from './analyze-performance/analyze-performance.component';
import { InventoryHistoryComponent } from './inventory-history/inventory-history.component';
import { ManageOffersComponent } from './manage-offers/manage-offers.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent, // contains header + sidebar
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'cart', component: CartComponent },
      { path: 'bill/:id', component: BillComponent },
      { path: 'items', component: AddnewitemComponent },
      { path: 'add_recipe', component: AddRecipeComponent },
      { path: 'invoice_list', component: CustomerComponent },
      { path: 'sales_summary', component: SalessummeryComponent },
      { path: 'analyze-performance', component: AnalyzePerformanceComponent },
      { path: 'row-material-management', component: RowMaterialComponent },
      { path: 'inventory-history', component: InventoryHistoryComponent },
      { path: 'manage_offers', component: ManageOffersComponent },
      { path: 'add_recipe', component: AddRecipeComponent },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
