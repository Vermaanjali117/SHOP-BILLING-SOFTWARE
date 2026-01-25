import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(){}

  getSummary(from?:string, to?:string): Observable<any> {
    const mock = { revenue:12800, transactions:152, aov:84.21, itemsSold:432, discountGiven:920, discountPct:3.2, periodLabel:'Last 7 days', peakHourLabel:'13:00', peakHourCount:28 };
    return of(mock).pipe(delay(200));
  }

  getRevenueSeries(from?:string, to?:string, gran='day'): Observable<any[]> {
    // mock timeseries (date,value)
    const series = [
      { date:'2025-11-05', value:800 },
      { date:'2025-11-06', value:1200 },
      { date:'2025-11-07', value:1400 },
      { date:'2025-11-08', value:2000 },
      { date:'2025-11-09', value:1600 },
      { date:'2025-11-10', value:2200 },
      { date:'2025-11-11', value:2400 }
    ];
    return of(series).pipe(delay(200));
  }

  getHourHeatmap(from?:string, to?:string): Observable<any> {
    // xLabels (hours) and yLabels (days) + sample data triple [xIndex,yIndex,value]
    const hours = Array.from({length:24}, (_,i)=>`${i}:00`);
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const data:any[] = [];
    for(let d=0; d<days.length; d++){
      for(let h=0; h<24; h++){
        const v = Math.floor(Math.random()*10);
        data.push([h, d, v]);
      }
    }
    return of({data, xLabels: hours, yLabels: days}).pipe(delay(200));
  }

  getTopItems(from?:string, to?:string): Observable<any[]> {
    const top = [
      { name:'Belgique Bliss', qty:120, revenue:6000 },
      { name:'Triple Chocolate Waffle', qty:92, revenue:4600 },
      { name:'Nutella Shake', qty:45, revenue:2700 },
      { name:'KitKat', qty:34, revenue:1900 }
    ];
    return of(top).pipe(delay(200));
  }

  getCategoryShare(from?:string, to?:string): Observable<any[]> {
    const cats = [
      { name:'Waffles', value:5000 },
      { name:'Shakes', value:3200 },
      { name:'Desserts', value:2600 }
    ];
    return of(cats).pipe(delay(200));
  }

  getRecentOrders(from?:string, to?:string): Observable<any[]> {
    const orders = [
      { orderNumber:'INV-1765472251324', date:new Date(), items:[{name:'KitKat',qty:1}], paymentMode:'Cash', grandTotal:112 },
      { orderNumber:'INV-1765470765931', date:new Date(), items:[{name:'Belgique Bliss',qty:1}], paymentMode:'Card', grandTotal:160 }
    ];
    return of(orders).pipe(delay(200));
  }

  exportCsv(){ return of(null); }
  searchOrders(q:string){ return this.getRecentOrders(); }
}
