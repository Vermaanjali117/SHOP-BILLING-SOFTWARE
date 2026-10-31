import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../Shared/dashboard.service';
import { SharedService } from '../../../Shared/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    BarchartComponent,
    DonutchartComponent,
    AgGridModule,
  ],
  styleUrls: ['./analyze-performance.component.css'],
})
export class AnalyzePerformanceComponent implements OnInit {
  selectedPeriod: 'today' | '7days' | '30days' | 'custom' = '7days';
  totalRevenue: number = 0;
  totalOrders: number = 0;
  totalConsumption: number = 0;
  consumptionList: any[] = [];
  fromDate?: string;
  toDate?: string;
  customFrom: string = '';
  customTo: string = '';
  salesSummary: any = [];
  revenueSeries: Array<{ label: string; value: number }> = [];
  paymentSeries: Array<{ name: string; value: number }> = [];
  paymentStats = {
    cash: 0,
    upi: 0,
    card: 0,
    total: 0,
  };

  constructor(
    private svc: DashboardService,
    private sharedSvc: SharedService,
  ) {}

  formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getPaymentPct(mode: 'Cash' | 'UPI' | 'Card'): number {
    const total = this.paymentStats.total || (this.paymentStats.cash + this.paymentStats.upi + this.paymentStats.card);
    if (!total || total === 0) return 0;
    const val = mode === 'Cash' ? this.paymentStats.cash : mode === 'UPI' ? this.paymentStats.upi : this.paymentStats.card;
    return Math.round((val / total) * 100);
  }

  ngOnInit(): void {
    this.setPeriod('7days');
  }

  setPeriod(period: 'today' | '7days' | '30days' | 'custom') {
    this.selectedPeriod = period;
    const now = new Date();
    const toStr = this.formatDateISO(now);
    let fromDateObj = new Date();

    if (period === 'today') {
      fromDateObj = now;
    } else if (period === '7days') {
      fromDateObj.setDate(now.getDate() - 6);
    } else if (period === '30days') {
      fromDateObj.setDate(now.getDate() - 29);
    }

    this.fromDate = this.formatDateISO(fromDateObj);
    this.toDate = toStr;
    this.customFrom = this.fromDate;
    this.customTo = this.toDate;
    this.loadDashboardData(this.fromDate, this.toDate);
  }

  applyCustomDate() {
    if (!this.customFrom || !this.customTo) return;
    if (this.customFrom > this.customTo) {
      const temp = this.customFrom;
      this.customFrom = this.customTo;
      this.customTo = temp;
    }
    this.selectedPeriod = 'custom';
    this.fromDate = this.customFrom;
    this.toDate = this.customTo;
    this.loadDashboardData(this.fromDate, this.toDate);
  }

  openPickerByRef(input: HTMLInputElement) {
    try {
      input?.showPicker();
    } catch (e) {
      input?.focus();
    }
  }

  openDatePicker(event: any) {
    try {
      if (event?.target?.showPicker) {
        event.target.showPicker();
      }
    } catch (e) {
      // Fallback
    }
  }

  resetFilter() {
    this.setPeriod('7days');
  }

  loadDashboardData(from?: string, to?: string) {
    this.loadRevenueCard(from, to);
    this.loadConsumptionCard(from, to);
  }

  loadRevenueCard(from?: string, to?: string) {
    this.sharedSvc.getsalessummery(from, to).subscribe((res: any) => {
      const sales = res.sales || [];
      this.salesSummary = sales;

      this.totalRevenue = sales.reduce(
        (sum: number, s: any) => sum + (s.totalSales || 0),
        0,
      );

      this.totalOrders = sales.reduce(
        (sum: number, s: any) => sum + (s.orderCount || 0),
        0,
      );

      // Build daily sequence for the bar chart
      this.revenueSeries = this.buildDailySequence(from, to, sales);

      // Process payment mode breakdown (Cash, Card, UPI)
      const breakdown = res.paymentBreakdown || [];
      const paymentMap: Record<string, number> = {
        Cash: 0,
        UPI: 0,
        Card: 0,
      };

      breakdown.forEach((item: any) => {
        const mode = item._id || 'Other';
        if (mode === 'Cash' || mode === 'UPI' || mode === 'Card') {
          paymentMap[mode] = item.totalAmount || 0;
        } else {
          paymentMap[mode] = (paymentMap[mode] || 0) + (item.totalAmount || 0);
        }
      });

      this.paymentStats = {
        cash: paymentMap['Cash'] || 0,
        upi: paymentMap['UPI'] || 0,
        card: paymentMap['Card'] || 0,
        total: (paymentMap['Cash'] || 0) + (paymentMap['UPI'] || 0) + (paymentMap['Card'] || 0),
      };

      this.paymentSeries = [
        { name: 'Cash', value: this.paymentStats.cash },
        { name: 'UPI', value: this.paymentStats.upi },
        { name: 'Card', value: this.paymentStats.card },
      ];
    });
  }

  private buildDailySequence(
    from?: string,
    to?: string,
    sales: any[] = [],
  ): Array<{ label: string; value: number }> {
    if (!from || !to) {
      return sales.map((s) => ({
        label: String(s._id || '').slice(-2),
        value: s.totalSales || 0,
      }));
    }

    const partsStart = from.split('-').map(Number);
    const partsEnd = to.split('-').map(Number);
    const start = new Date(partsStart[0], partsStart[1] - 1, partsStart[2]);
    const end = new Date(partsEnd[0], partsEnd[1] - 1, partsEnd[2]);
    const days: Array<{ label: string; value: number }> = [];

    const salesMap = new Map<string, number>();
    sales.forEach((s) => {
      salesMap.set(String(s._id), s.totalSales || 0);
    });

    const curr = new Date(start);
    while (curr <= end && days.length < 366) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayNum = String(curr.getDate());
      days.push({
        label: dayNum,
        value: salesMap.get(dateStr) || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return days;
  }

  loadConsumptionCard(from?: string, to?: string) {
    this.sharedSvc.getConsumptionSummary(from, to).subscribe((res: any) => {
      const list = res.summary || [];
      this.totalConsumption = list.reduce(
        (sum: number, m: any) => sum + (m.totalUsed || 0),
        0,
      );

      // Compute share percentage for each material
      this.consumptionList = list.map((item: any) => ({
        name: item.name,
        totalUsed: item.totalUsed,
        unit: item.unit || 'gm',
        sharePct: this.totalConsumption > 0
          ? Math.round((item.totalUsed / this.totalConsumption) * 100)
          : 0,
      }));
    });
  }
}
