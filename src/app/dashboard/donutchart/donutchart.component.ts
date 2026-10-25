import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-donutchart',
  standalone: true,
  templateUrl: './donutchart.component.html',
  styleUrls: ['./donutchart.component.css'],
})
export class DonutchartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('donutChart', { static: true }) donutChart!: ElementRef;

  @Input() data: Array<{ name: string; value: number }> = [];
  @Input() title: string = 'Payment Split';

  private chart?: echarts.ECharts;

  private colorMap: Record<string, string> = {
    Cash: '#EA580C', // Vibrant orange
    UPI: '#292524',  // Deep espresso charcoal
    Card: '#E5D5C5', // Warm tan/cream
    Other: '#A89988',
  };

  ngAfterViewInit(): void {
    this.initChart();
    window.addEventListener('resize', this.onResize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.chart?.dispose();
  }

  private onResize = () => {
    this.chart?.resize();
  };

  private initChart(): void {
    const chartDom = this.donutChart.nativeElement;
    this.chart = echarts.init(chartDom);
    this.updateChart();
    setTimeout(() => this.chart?.resize(), 100);
  }

  private updateChart(): void {
    if (!this.chart) return;

    const chartData = (this.data || []).map((item) => ({
      name: item.name,
      value: item.value || 0,
      itemStyle: {
        color: this.colorMap[item.name] || undefined,
      },
    }));

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const val = Number(params.value || 0).toLocaleString('en-IN');
          return `<b>${params.name}</b><br/>Revenue: ₹${val} (${params.percent}%)`;
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: this.title,
          type: 'pie',
          radius: '72%',
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              if (!params.value || params.value === 0) return '';
              const val = Number(params.value).toLocaleString('en-IN');
              return `{b|${params.name}}\n{v|₹${val}} {p|(${params.percent}%)}`;
            },
            rich: {
              b: {
                fontSize: 13,
                fontWeight: 700,
                color: '#1E1711',
                lineHeight: 18,
              },
              v: {
                fontSize: 12,
                fontWeight: 600,
                color: '#786657',
                lineHeight: 16,
              },
              p: {
                fontSize: 12,
                fontWeight: 800,
                color: '#EA580C',
                lineHeight: 16,
              },
            },
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 14,
            smooth: 0.2,
            lineStyle: {
              width: 1.5,
              color: '#D4C3B3',
            },
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            itemStyle: {
              shadowBlur: 14,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          data: chartData.length > 0 ? chartData : [{ name: 'No Data', value: 0 }],
        },
      ],
    };

    this.chart.setOption(option, true);
    setTimeout(() => this.chart?.resize(), 50);
  }
}
