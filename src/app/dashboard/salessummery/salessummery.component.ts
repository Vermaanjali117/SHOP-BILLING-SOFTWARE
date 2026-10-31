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
import * as echarts from 'echarts';

@Component({
  selector: 'app-salessummery',
  templateUrl: './salessummery.component.html',
  styleUrls: ['./salessummery.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SalessummeryComponent implements OnInit, AfterViewInit, OnDestroy {
  date: any = [];
  totalsale: any = [];
  ordercount: any = [];
  chartdata: any = [];

  // Filter State
  selectedPreset: 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom' =
    'all';
  customFrom: string = '';
  customTo: string = '';

  private myChart: any = null;
  private resizeListener = () => {
    if (this.myChart) {
      this.myChart.resize();
    }
  };

  constructor(
    private service: SharedService,
    private el: ElementRef,
    private loader: LoaderService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.loader.show(), 0);
    this.getsalesummery();
    window.addEventListener('resize', this.resizeListener);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }

  formatDateISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  setPreset(preset: 'all' | 'today' | '7days' | '30days' | 'thisMonth') {
    this.selectedPreset = preset;
    const now = new Date();

    if (preset === 'today') {
      const todayStr = this.formatDateISO(now);
      this.customFrom = todayStr;
      this.customTo = todayStr;
      this.getsalesummery(todayStr, todayStr);
    } else if (preset === '7days') {
      const fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 6);
      this.customFrom = this.formatDateISO(fromDate);
      this.customTo = this.formatDateISO(now);
      this.getsalesummery(this.customFrom, this.customTo);
    } else if (preset === '30days') {
      const fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 29);
      this.customFrom = this.formatDateISO(fromDate);
      this.customTo = this.formatDateISO(now);
      this.getsalesummery(this.customFrom, this.customTo);
    } else if (preset === 'thisMonth') {
      const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      this.customFrom = this.formatDateISO(fromDate);
      this.customTo = this.formatDateISO(now);
      this.getsalesummery(this.customFrom, this.customTo);
    } else {
      this.customFrom = '';
      this.customTo = '';
      this.getsalesummery();
    }
  }

  applyCustomFilter() {
    if (!this.customFrom || !this.customTo) return;
    if (this.customFrom > this.customTo) {
      const temp = this.customFrom;
      this.customFrom = this.customTo;
      this.customTo = temp;
    }
    this.selectedPreset = 'custom';
    this.getsalesummery(this.customFrom, this.customTo);
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
    this.setPreset('all');
  }

  getsalesummery(from?: string, to?: string) {
    this.loader.show();
    this.service.getsalessummery(from, to).subscribe({
      next: (res: any) => {
        this.chartdata = res.sales || [];
        this.date = [];
        this.totalsale = [];
        this.ordercount = [];

        for (let i = 0; i < this.chartdata.length; i++) {
          this.date.push(this.chartdata[i]._id);
          this.totalsale.push(this.chartdata[i].totalSales);
          this.ordercount.push(this.chartdata[i].orderCount);
        }

        this.getchartdata();
        this.loader.hide();
      },
      error: (err: any) => {
        console.error(err);
        this.loader.hide();
      },
    });
  }

  getchartdata() {
    const chartDom = this.el.nativeElement.querySelector('#main');
    if (!chartDom) return;

    if (!this.myChart) {
      this.myChart = echarts.init(chartDom);
    }

    const option = {
      title: {
        text: 'Sales Overview',
        left: 'center',
        textStyle: {
          color: '#1E1711',
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      legend: {
        right: '4%',
        top: 4,
        data: ['total sale', 'Order Count'],
        textStyle: { color: '#4B3621', fontSize: 12 },
      },
      xAxis: {
        type: 'category',
        data: this.date, // Dates array from API
        axisLabel: { color: '#6b7280' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280' },
      },
      series: [
        {
          name: 'total sale',
          data: this.totalsale, // Sales array from API
          type: 'line',
          smooth: true,
          itemStyle: { color: '#ea580c' }, // Replaced irrelevant blue with warm cafe orange
          lineStyle: { color: '#ea580c', width: 2.5 },
        },
        {
          name: 'Order Count',
          data: this.ordercount,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#78350f' }, // Roasted espresso brown matching theme
          lineStyle: { color: '#78350f', width: 2.5 },
        },
      ],
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          if (!params || !params.length) return '';
          const date = params[0].axisValue;
          const amount = params.find(
            (p: any) => p.seriesName === 'total sale',
          )?.data ?? 0;
          const orders = params.find(
            (p: any) => p.seriesName === 'Order Count',
          )?.data ?? 0;
          return `
            Date: ${date}<br/>
            Total Amount: ₹${amount}<br/>
            Order Count: ${orders}
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 50,
        containLabel: true,
      },
    };

    this.myChart.setOption(option, true);
  }
}
