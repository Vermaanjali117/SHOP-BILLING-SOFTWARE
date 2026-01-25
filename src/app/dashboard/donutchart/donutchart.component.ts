import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as echarts from 'echarts';
@Component({
  selector: 'app-donutchart',
  standalone: true,
  templateUrl: './donutchart.component.html',
  styleUrls: ['./donutchart.component.css'],
})
export class DonutchartComponent implements OnInit {
  @ViewChild('donutChart', { static: true }) donutChart!: ElementRef;

  @Input() data: any[] = [];
  ngOnInit(): void {
    this.renderChart();
  }
  renderChart() {
    const chartDom = this.donutChart.nativeElement;
    const myChart = echarts.init(chartDom);

    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '5%',
        left: 'center',
      },

      // DONUT CHART CONFIG
      series: [
        {
          name: 'Category Revenue',
          type: 'pie',
          radius: ['40%', '70%'], // inner & outer radius (makes donut)
          avoidLabelOverlap: false,

          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },

          label: {
            show: false,
            position: 'center',
          },

          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
            },
          },

          labelLine: {
            show: false,
          },

          data: [
            { value: 55, name: 'Waffles' },
            { value: 25, name: 'Shakes' },
            { value: 15, name: 'Ice Cream' },
            { value: 5, name: 'Cheesecakes' },
          ],
        },
      ],
    };

    myChart.setOption(option);

    // Responsive
    window.addEventListener('resize', () => {
      myChart.resize();
    });
  }
}
