import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-barchart',
  standalone: true,
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css'],
})
export class BarchartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef;
  @Input() data: any[] = [];
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  chart?: echarts.ECharts;

  ngAfterViewInit() {
    this.chart = echarts.init(this.host.nativeElement);
    this.update();
    window.addEventListener('resize', this.onResize);
  }
  ngOnChanges() {
    this.update();
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.chart?.dispose();
  }
  onResize = () => this.chart && this.chart.resize();

  update() {
    if (!this.chart) return;
    const labels = (this.data || []).map((i: any) => String(i.label ?? i.name ?? ''));
    const vals = (this.data || []).map(
      (i: any) => i.value ?? i.qty ?? i.revenue ?? 0,
    );

    const opt: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          return `<b>Day ${item.name}</b><br/>Revenue: ₹${Number(
            item.value || 0,
          ).toLocaleString('en-IN')}`;
        },
      },
      grid: {
        top: 20,
        right: 10,
        bottom: 25,
        left: 10,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#8C7A6B',
          fontWeight: 600,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'bar',
          data: vals,
          barWidth: 32,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F59E0B' },
              { offset: 1, color: '#EA580C' },
            ]),
          },
        },
      ],
    };
    this.chart.setOption(opt, true);
  }
}
