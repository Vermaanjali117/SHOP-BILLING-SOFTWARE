import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    RouterModule,
    NgSelectModule,
    AgGridModule,
  ],
})
export class DashboardModule {}
