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
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: values, smooth: true, areaStyle: {} }],
      ...this.options
    };
    this.chart.setOption(opt, true);
  }
}
