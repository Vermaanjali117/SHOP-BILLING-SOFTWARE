import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../Shared/shared.service';
import { LoaderService } from '../../../Shared/loader.service';
import { ToastrService } from 'ngx-toastr';
import * as echarts from 'echarts';

interface ExpenseItem {
  _id?: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMode: string;
  notes?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-track-expenses',
  templateUrl: './track-expenses.component.html',
  styleUrls: ['./track-expenses.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrackExpensesComponent implements OnInit, AfterViewInit, OnDestroy {
  // Period & Date Filter
  selectedPeriod: 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom' =
    '30days';
  fromDate: string = '';
  toDate: string = '';
  customFrom: string = '';
  customTo: string = '';

  // Summary Metrics
  totalEarnings: number = 0;
  totalExpenses: number = 0;
  netProfit: number = 0;
  profitMargin: number = 0;
  orderCount: number = 0;

  // Expenses Data
  expensesList: ExpenseItem[] = [];
  filteredExpenses: ExpenseItem[] = [];
  searchTerm: string = '';
  selectedCategoryFilter: string = 'All';

  // Category Breakdown for Chart
  categoryBreakdown: Array<{ _id: string; totalAmount: number; count: number }> =
    [];
  dailyComparison: Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
  }> = [];

  // Modal State (Add / Edit)
  showExpenseModal: boolean = false;
  isEditing: boolean = false;
  editingId: string | null = null;
  isSaving: boolean = false;
  expenseForm: {
    title: string;
    category: string;
    amount: number | null;
    date: string;
    paymentMode: string;
    notes: string;
  } = {
    title: '',
    category: 'Electricity Bill',
    amount: null,
    date: '',
    paymentMode: 'Cash',
    notes: '',
  };

  // Predefined Categories
  categories: string[] = [
    'Electricity Bill',
    'Employee Salary',
    'Raw Materials',
    'Shop Rent',
    'Water Bill',
    'Maintenance & Repairs',
    'Marketing & Ads',
    'Packaging & Disposables',
    'Other Expense',
  ];

  paymentModes: string[] = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

  // ECharts instances
  private categoryChart: any = null;
  private trendChart: any = null;
  private resizeListener = () => {
    if (this.categoryChart) this.categoryChart.resize();
    if (this.trendChart) this.trendChart.resize();
  };

  constructor(
    private sharedSvc: SharedService,
    private loader: LoaderService,
    private toast: ToastrService,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    window.addEventListener('resize', this.resizeListener);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    if (this.categoryChart) {
      this.categoryChart.dispose();
      this.categoryChart = null;
    }
    if (this.trendChart) {
      this.trendChart.dispose();
      this.trendChart = null;
    }
  }

  formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
    } catch (e) {}
  }

  setPeriod(period: 'all' | 'today' | '7days' | '30days' | 'thisMonth') {
    this.selectedPeriod = period;
    const now = new Date();

    if (period === 'today') {
      const todayStr = this.formatDateISO(now);
      this.fromDate = todayStr;
      this.toDate = todayStr;
    } else if (period === '7days') {
      const fromDateObj = new Date(now);
      fromDateObj.setDate(now.getDate() - 6);
      this.fromDate = this.formatDateISO(fromDateObj);
      this.toDate = this.formatDateISO(now);
    } else if (period === '30days') {
      const fromDateObj = new Date(now);
      fromDateObj.setDate(now.getDate() - 29);
      this.fromDate = this.formatDateISO(fromDateObj);
      this.toDate = this.formatDateISO(now);
    } else if (period === 'thisMonth') {
      const fromDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
      this.fromDate = this.formatDateISO(fromDateObj);
      this.toDate = this.formatDateISO(now);
    } else {
      // 'all'
      this.fromDate = '';
      this.toDate = '';
    }

    this.customFrom = this.fromDate;
    this.customTo = this.toDate;
    this.loadAllData();
  }

  applyCustomFilter() {
    if (!this.customFrom || !this.customTo) return;
    if (this.customFrom > this.customTo) {
      const temp = this.customFrom;
      this.customFrom = this.customTo;
      this.customTo = temp;
    }
    this.selectedPeriod = 'custom';
    this.fromDate = this.customFrom;
    this.toDate = this.customTo;
    this.loadAllData();
  }

  resetFilter() {
    this.fromDate = '';
    this.toDate = '';
    this.customFrom = '';
    this.customTo = '';
    this.loadAllData();
  }

  // Load both summary (profit & categories) and expenses list
  loadAllData() {
    this.loader.show();
    this.loadSummary();
    this.loadExpensesList();
  }

  loadSummary() {
    this.sharedSvc
      .getExpenseSummary(this.fromDate, this.toDate)
      .subscribe({
        next: (res: any) => {
          this.totalEarnings = res.totalEarnings || 0;
          this.totalExpenses = res.totalExpenses || 0;
          this.netProfit = res.netProfit || 0;
          this.profitMargin = res.profitMargin || 0;
          this.orderCount = res.orderCount || 0;

          this.categoryBreakdown = res.categoryBreakdown || [];
          this.dailyComparison = res.dailyComparison || [];

          setTimeout(() => {
            this.renderCategoryChart();
            this.renderTrendChart();
          }, 50);
        },
        error: (err: any) => {
          console.error('Error fetching expense summary:', err);
        },
      });
  }

  loadExpensesList() {
    this.sharedSvc
      .getExpenses(this.fromDate, this.toDate)
      .subscribe({
        next: (res: any) => {
          this.expensesList = res.expenses || [];
          this.applyLocalFilter();
          this.loader.hide();
        },
        error: (err: any) => {
          console.error('Error fetching expenses list:', err);
          this.loader.hide();
        },
      });
  }

  applyLocalFilter() {
    let result = [...this.expensesList];

    if (this.selectedCategoryFilter && this.selectedCategoryFilter !== 'All') {
      result = result.filter((e) => e.category === this.selectedCategoryFilter);
    }

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          (e.notes && e.notes.toLowerCase().includes(term)) ||
          e.paymentMode.toLowerCase().includes(term),
      );
    }

    this.filteredExpenses = result;
  }

  // ---- Modal & CRUD Actions ----
  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.expenseForm = {
      title: '',
      category: 'Electricity Bill',
      amount: null,
      date: this.formatDateISO(new Date()),
      paymentMode: 'Cash',
      notes: '',
    };
    this.showExpenseModal = true;
  }

  openEditModal(item: ExpenseItem) {
    this.isEditing = true;
    this.editingId = item._id || null;
    this.expenseForm = {
      title: item.title,
      category: item.category,
      amount: item.amount,
      date: item.date ? item.date.split('T')[0] : this.formatDateISO(new Date()),
      paymentMode: item.paymentMode || 'Cash',
      notes: item.notes || '',
    };
    this.showExpenseModal = true;
  }

  closeModal() {
    this.showExpenseModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveExpense() {
    if (!this.expenseForm.title || !this.expenseForm.title.trim()) {
      this.toast.warning('Please enter an expense title');
      return;
    }
    if (
      this.expenseForm.amount === null ||
      this.expenseForm.amount === undefined ||
      this.expenseForm.amount < 0
    ) {
      this.toast.warning('Please enter a valid expense amount');
      return;
    }

    this.isSaving = true;

    if (this.isEditing && this.editingId) {
      this.sharedSvc
        .updateExpense(this.editingId, this.expenseForm)
        .subscribe({
          next: () => {
            this.toast.success('Expense updated successfully');
            this.isSaving = false;
            this.closeModal();
            this.loadAllData();
          },
          error: (err: any) => {
            this.toast.error(err?.error?.message || 'Failed to update expense');
            this.isSaving = false;
          },
        });
    } else {
      this.sharedSvc.addExpense(this.expenseForm).subscribe({
        next: () => {
          this.toast.success('Expense recorded successfully');
          this.isSaving = false;
          this.closeModal();
          this.loadAllData();
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message || 'Failed to record expense');
          this.isSaving = false;
        },
      });
    }
  }

  deleteExpense(item: ExpenseItem) {
    if (!item._id) return;
    if (confirm(`Are you sure you want to delete "${item.title}" (₹${item.amount})?`)) {
      this.sharedSvc.deleteExpense(item._id).subscribe({
        next: () => {
          this.toast.success('Expense deleted successfully');
          this.loadAllData();
        },
        error: (err: any) => {
          this.toast.error(err?.error?.message || 'Failed to delete expense');
        },
      });
    }
  }

  // ---- ECharts Visualizations ----
  renderCategoryChart() {
    const chartDom = this.el.nativeElement.querySelector('#categoryChart');
    if (!chartDom) return;

    if (!this.categoryChart) {
      this.categoryChart = echarts.init(chartDom);
    }

    if (this.categoryBreakdown.length === 0) {
      this.categoryChart.clear();
      return;
    }

    const data = this.categoryBreakdown.map((c) => ({
      name: c._id,
      value: c.totalAmount,
    }));

    // Warm, distinct cafe palette for categories
    const palette = [
      '#EA580C', // Orange (Terracotta)
      '#78350F', // Dark Espresso
      '#F59E0B', // Amber Gold
      '#059669', // Emerald
      '#8B5CF6', // Purple
      '#3B82F6', // Blue
      '#EC4899', // Pink
      '#64748B', // Slate
      '#D97706', // Ochre
    ];

    const option: any = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#2C1810',
        borderColor: '#451A03',
        borderWidth: 1,
        textStyle: { color: '#FAF7F2', fontSize: 12 },
        formatter: (params: any) => {
          return `
            <div style="font-weight: 700; color: #FAF7F2; margin-bottom: 4px;">
              ${params.marker} ${params.name}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px;">
              <span style="color: #FDBA74;">Amount:</span>
              <strong style="color: #FFFFFF;">₹${params.value.toLocaleString('en-IN')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px;">
              <span style="color: #E2E8F0;">Share:</span>
              <strong style="color: #FFFFFF;">${params.percent}%</strong>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        textStyle: {
          color: '#352518',
          fontSize: 11,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
        },
        formatter: (name: string) => {
          const item = this.categoryBreakdown.find((c) => c._id === name);
          const amt = item ? ` (₹${item.totalAmount.toLocaleString('en-IN')})` : '';
          return `${name}${amt}`;
        },
      },
      color: palette,
      series: [
        {
          name: 'Expense Category',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 13,
              fontWeight: 'bold',
              color: '#1E1711',
              formatter: '{b}\n₹{c}',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          data,
        },
      ],
    };

    this.categoryChart.setOption(option, true);
  }

  renderTrendChart() {
    const chartDom = this.el.nativeElement.querySelector('#trendChart');
    if (!chartDom) return;

    if (!this.trendChart) {
      this.trendChart = echarts.init(chartDom);
    }

    if (this.dailyComparison.length === 0) {
      this.trendChart.clear();
      return;
    }

    const dates = this.dailyComparison.map((d) => {
      try {
        const parts = d.date.split('-');
        if (parts.length === 3) {
          const dt = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
          );
          return dt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          });
        }
        return d.date;
      } catch {
        return d.date;
      }
    });

    const revenueData = this.dailyComparison.map((d) => d.revenue);
    const expenseData = this.dailyComparison.map((d) => d.expenses);
    const profitData = this.dailyComparison.map((d) => d.profit);

    const option: any = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#2C1810',
        borderColor: '#451A03',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#FAF7F2', fontSize: 12 },
        formatter: (params: any) => {
          if (!params || !params.length) return '';
          const idx = params[0].dataIndex;
          const rawItem = this.dailyComparison[idx];
          return `
            <div style="font-weight: 700; color: #FAF7F2; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 3px;">
              📅 ${rawItem?.date || params[0].axisValue}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px; margin-bottom: 2px;">
              <span style="color: #4ADE80;">💰 Revenue:</span>
              <strong style="color: #FFFFFF;">₹${(rawItem?.revenue || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px; margin-bottom: 2px;">
              <span style="color: #FB923C;">💸 Expenses:</span>
              <strong style="color: #FFFFFF;">₹${(rawItem?.expenses || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 14px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 3px;">
              <span style="color: ${rawItem?.profit >= 0 ? '#86EFAC' : '#FCA5A5'}; font-weight: 700;">📈 Net Profit:</span>
              <strong style="color: #FFFFFF;">₹${(rawItem?.profit || 0).toLocaleString('en-IN')}</strong>
            </div>
          `;
        },
      },
      legend: {
        top: 2,
        right: '2%',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
          color: '#4B3621',
          fontSize: 11,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
        },
        data: ['Revenue (Earnings)', 'Total Expenses', 'Net Profit'],
      },
      grid: {
        left: '2%',
        right: '2%',
        top: 36,
        bottom: 20,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#E8DEC9' } },
        axisTick: { show: false },
        axisLabel: { color: '#6B7280', fontSize: 10, margin: 8 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F3E8DE', type: 'dashed' } },
        axisLabel: {
          color: '#78350F',
          fontSize: 10,
          formatter: (v: number) => `₹${v}`,
        },
      },
      series: [
        {
          name: 'Revenue (Earnings)',
          type: 'bar',
          data: revenueData,
          barMaxWidth: 18,
          itemStyle: {
            color: '#10B981',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Total Expenses',
          type: 'bar',
          data: expenseData,
          barMaxWidth: 18,
          itemStyle: {
            color: '#EA580C',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Net Profit',
          type: 'line',
          data: profitData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#0284C7' },
          lineStyle: { color: '#0284C7', width: 2.5 },
        },
      ],
    };

    this.trendChart.setOption(option, true);
  }

  getCategoryColor(category: string): { bg: string; text: string; border: string; icon: string } {
    switch (category) {
      case 'Electricity Bill':
        return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: '⚡' };
      case 'Employee Salary':
        return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: '👷' };
      case 'Raw Materials':
        return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', icon: '📦' };
      case 'Shop Rent':
        return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: '🏬' };
      case 'Water Bill':
        return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', icon: '💧' };
      case 'Maintenance & Repairs':
        return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', icon: '🔧' };
      case 'Marketing & Ads':
        return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: '📢' };
      case 'Packaging & Disposables':
        return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: '🛍️' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200', icon: '📝' };
    }
  }
}
