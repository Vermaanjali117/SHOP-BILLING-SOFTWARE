import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { RouterModule } from '@angular/router';

import { SalessummeryComponent } from './salessummery/salessummery.component';
import { RowMaterialComponent } from './row-material/row-material.component';
import { AddRecipeComponent } from './add-recipe/add-recipe.component';
import { InventoryHistoryComponent } from './inventory-history/inventory-history.component';

@NgModule({
  declarations: [ SalessummeryComponent, RowMaterialComponent, AddRecipeComponent, InventoryHistoryComponent,],
  imports: [CommonModule, FormsModule, DashboardRoutingModule, RouterModule,
    AgGridModule 
  ],
})
export class DashboardModule {}
