import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { LoaderService } from '../../../Shared/loader.service';
import * as echarts from 'echarts';
@Component({
  selector: 'app-salessummery',
  templateUrl: './salessummery.component.html',
  styleUrls: ['./salessummery.component.css'],
})
export class SalessummeryComponent implements OnInit, AfterViewInit {
  date: any = [];
  totalsale: any = [];
  totalamount: any = [];
  chartdata: any = [];
  ordercount: any = [];
  constructor(
    private service: SharedService,
    private el: ElementRef,
    private loader: LoaderService
  ) {}
  ngAfterViewInit(): void {}
  ngOnInit(): void {
    setTimeout(() => this.loader.show(), 0);
    this.getsalesummery();
  }
  getsalesummery() {
    this.service.getsalessummery().subscribe((res: any) => {
      this.chartdata = res;
  
      for (let i = 0; i < this.chartdata.length; i++) {
        this.date.push(res[i]._id);
        this.totalsale.push(res[i].totalSales);
        this.ordercount.push(res[i].orderCount);
      }
    });
    setTimeout(() => {
      this.getchartdata();
          this.loader.hide();
    }, 3000);
  }
  getchartdata() {
    // ✅ Find the div inside this component
    const chartDom = this.el.nativeElement.querySelector('#main');
    const myChart = echarts.init(chartDom);

    const option = {
      title: {
        text: 'Sales Overview',
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
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6' },
        },
        {
          name: 'Order Count',
          data: this.ordercount,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { color: '#f59e0b' },
        },
      ],
      tooltip: { trigger: 'axis' },
      formatter: (params: any) => {
        const date = params[0].axisValue; // x-axis (date)
        const amount = params.find(
          (p: any) => p.seriesName === 'total sale'
        )?.data;
        const orders = params.find(
          (p: any) => p.seriesName === 'Order Count'
        )?.data;
        return `
        Date: ${date}<br/>
        Total Amount: ${amount}<br/>
        Order Count: ${orders}
      `;
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    };

    myChart.setOption(option);

    // ✅ Resize on window resize
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  }
}
