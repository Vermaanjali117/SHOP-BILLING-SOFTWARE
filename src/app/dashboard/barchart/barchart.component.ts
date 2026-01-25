import { Component, ElementRef, Input, AfterViewInit, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-barchart',
  standalone: true,
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements AfterViewInit, OnChanges, OnDestroy  {
 @ViewChild('host', { static: true }) host!: ElementRef;
  @Input() data: any[] = []; // expected: [{ name:'KitKat', qty: 20, revenue: 3200}, ...]
  chart?: echarts.ECharts;
  ngAfterViewInit(){ this.chart = echarts.init(this.host.nativeElement); this.update(); window.addEventListener('resize', this.onResize); }
  ngOnChanges(){ this.update(); }
  ngOnDestroy(){ this.chart?.dispose(); }
  onResize = () => this.chart && this.chart.resize();

  update(){
    if (!this.chart) return;
    const names = (this.data||[]).map(i => i.name);
    const vals = (this.data||[]).map(i => i.qty ?? i.value ?? 0);
    const opt = { tooltip:{}, xAxis:{ type:'value' }, yAxis:{ type:'category', data:names, inverse:true }, series:[{ type:'bar', data:vals, barCategoryGap:'40%' }] };
    this.chart.setOption(opt, true);
  }
}
