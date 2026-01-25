import { Component, ElementRef, OnInit, ViewChild ,Input} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-heatmapchart',
  standalone: true,
  templateUrl: './heatmapchart.component.html',
  styleUrls: ['./heatmapchart.component.css'],
})
export class HeatmapchartComponent implements OnInit {
  @ViewChild('heatmap', { static: true }) heatmapEl!: ElementRef;
    @Input() data: any[] = [];
  ngOnInit(): void {
    this.drawHeatmap();
  }
 drawHeatmap() {
    const chart = echarts.init(this.heatmapEl.nativeElement);

    const hours = [
      '10 AM',
      '11 AM',
      '12 PM',
      '1 PM',
      '2 PM',
      '3 PM',
      '4 PM',
      '5 PM',
      '6 PM',
      '7 PM',
    ];

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // dummy data
    const data = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 10; h++) {
        data.push([h, d, Math.floor(Math.random() * 40)]);
      }
    }

    const option = {
      tooltip: { position: 'top' },

      grid: {
        top: 20,
        bottom: 35,
        left: 45,
        right: 15,
        containLabel: true, // ⭐ ensures full width
      },

      xAxis: {
        type: 'category',
        data: hours,
        boundaryGap: true,
        axisLabel: { rotate: 45, fontSize: 10 },
      },

      yAxis: {
        type: 'category',
        data: days,
      },

      visualMap: {
        min: 0,
        max: 40,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
      },

      series: [
        {
          name: 'Orders',
          type: 'heatmap',
          data: data,
          emphasis: { focus: 'series' },
        },
      ],
    };

    chart.setOption(option);

    // ⭐ Forces proper full-width rendering
    setTimeout(() => {
      chart.resize({
        width: this.heatmapEl.nativeElement.clientWidth,
        height: 240,
      });
    }, 50);

    window.addEventListener('resize', () => chart.resize());
  }
}

