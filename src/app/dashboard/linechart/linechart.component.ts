import { Component, ElementRef, Input, OnChanges, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-linechart',
  standalone: true,
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent implements AfterViewInit, OnChanges, OnDestroy{
 @ViewChild('host', { static: true }) host!: ElementRef;
  @Input() data: any[] = []; // expected: [{ date:'2025-12-01', value: 100 }, ...]
  @Input() options: any = {};

  chart?: echarts.ECharts;

  ngAfterViewInit() { this.init(); }
  ngOnChanges() { this.update(); }
  ngOnDestroy() { this.chart?.dispose(); }

  init() {
    this.chart = echarts.init(this.host.nativeElement);
    this.update();
    window.addEventListener('resize', this.onResize);
  }
  onResize = () => this.chart && this.chart.resize();

  update() {
    if (!this.chart) return;
    console.log("this.data =====",this.data);
    const dates = (this.data || []).map(d => d.label);
    const values = (this.data || []).map(d => d.value);
    const opt = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = params[0];
          return `<b>${item.name}</b><br/>Revenue: ₹${Number(item.value || 0).toLocaleString('en-IN')}`;
        },
      },
      grid: {
        top: 20,
        right: 15,
        bottom: 25,
        left: 45,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { fontSize: 11, color: '#6B7280' },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 11,
          color: '#6B7280',
          formatter: (v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`,
        },
        splitLine: { lineStyle: { color: '#F3F4F6' } },
      },
      series: [
        {
          name: 'Revenue',
          type: 'line',
          data: values,
          smooth: true,
          symbolSize: 6,
          itemStyle: { color: '#6366F1' },
          lineStyle: { width: 3, color: '#6366F1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.25)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.01)' },
            ]),
          },
        },
      ],
      ...this.options,
    };
    this.chart.setOption(opt, true);
  }
}
