import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../Shared/dashboard.service';
import { SharedService } from '../../../Shared/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LinechartComponent } from '../linechart/linechart.component';
import { HeatmapchartComponent } from '../heatmapchart/heatmapchart.component';
import { BarchartComponent } from '../barchart/barchart.component';
import { DonutchartComponent } from '../donutchart/donutchart.component';
import { AgGridModule } from 'ag-grid-angular';
@Component({
  selector: 'app-analyze-performance',
  templateUrl: './analyze-performance.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LinechartComponent,
    AgGridModule,
    // HeatmapchartComponent,
    // BarchartComponent,
    // DonutchartComponent,
  ],
  styleUrls: ['./analyze-performance.component.css'],
})
export class AnalyzePerformanceComponent implements OnInit {
  selectedRange = '7days';
  totalRevenue: any;
  totalOrders: any;
  columnDefs: any;
  gridApi: any;
  gridColumnApi: any;
  totalConsumption: any = [];
  consumptionList: any = [];
  fromDate?: string;
  toDate?: string;
  rowData: any = [];
  granularity = 'day';
  salesSummary: any = [];
  revenueSeries: any = [];
  summary: any = {
    revenue: 0,
    transactions: 0,
    aov: 0,
    itemsSold: 0,
    discountGiven: 0,
    discountPct: 0,
    periodLabel: 'Last 7 days',
    peakHourLabel: null,
    peakHourCount: 0,
  };

  constructor(
    private svc: DashboardService,
    private sharedSvc: SharedService,
  ) {}

  ngOnInit(): void {
    const range = this.getLast7Days();

    this.fromDate = range.from;
    this.toDate = range.to;
    this.loadDashboardData(this.fromDate, this.toDate);
  }
  loadDashboardData(from?: string, to?: string) {
    this.loadRevenueCard(from, to);
    this.loadConsumptionCard(from, to);
  }

  loadRevenueCard(from?: string, to?: string) {
    this.sharedSvc.getsalessummery(from, to).subscribe((res: any) => {
      const sales = res.sales || [];

      this.salesSummary = sales;
      this.revenueSeries = this.salesSummary.map(
        (s: { _id: any; totalSales: any }) => ({
          label: s._id, // date
          value: s.totalSales, // revenue
        }),
      );
      this.totalRevenue = sales.reduce(
        (sum: number, s: any) => sum + s.totalSales,
        0,
      );

      this.totalOrders = sales.reduce(
        (sum: number, s: any) => sum + s.orderCount,
        0,
      );

      console.log('Revenue:', this.totalRevenue);
      console.log('Orders:', this.totalOrders);
    });
  }

  loadConsumptionCard(from?: string, to?: string) {
    this.sharedSvc.getConsumptionSummary(from, to).subscribe((res: any) => {
      const list = res.summary || [];

      this.consumptionList = list;
      this.getaddedittable();
      this.totalConsumption = list.reduce(
        (sum: number, m: any) => sum + m.totalUsed,
        0,
      );
    });
  }

  loadRevenueSeries() {
    this.svc
      .getRevenueSeries(this.fromDate, this.toDate, this.granularity)
      .subscribe((s) => (this.revenueSeries = s));
  }
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  getLast7Days(): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 6); // last 7 days incl today

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }
  applyDateFilter() {
    alert('ghgh');
    console.log('from', this.fromDate);
    console.log('to', this.toDate);
    if (!this.fromDate || !this.toDate) return;

    this.loadDashboardData(this.fromDate, this.toDate);
  }

  resetToLast7Days() {
    const range = this.getLast7Days();
    this.fromDate = range.from;
    this.toDate = range.to;

    this.loadDashboardData(this.fromDate, this.toDate);
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getaddedittable() {
    this.columnDefs = [
      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
      },
      {
        headerName: 'Raw Material',
        field: 'name',
        flex: 2,
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Total Used',
        field: 'totalUsed',
        flex: 1,
        sortable: true,
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: 'Unit',
        field: 'unit',
        width: 100,
      },
      {
        headerName: 'Usage Count',
        field: 'usageCount',
        flex: 1,
        sortable: true,
        filter: 'agNumberColumnFilter',
      },
    ];

    this.rowData = this.consumptionList;
  }

  exportCsv() {
    this.svc.exportCsv().subscribe((blob) => {
      /* trigger download */
    });
  }

  openOrder(o: any) {
    /* modal */
  }
  editOrder(o: any) {
    /* reuse edit flow: set cart service, localStorage, navigate to cart */
  }
  loadMoreOrders() {
    /* pagination */
  }
}
