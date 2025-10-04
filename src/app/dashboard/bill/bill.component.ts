import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../Shared/shared.service';
import { CommonModule, DatePipe } from '@angular/common';
import { CartService } from '../../../Shared/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe],
})
export class BillComponent implements OnInit {
  order: any;
  orderId: any;
  order_detail: any = [];
  order_items: any = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public service: SharedService,
    public cartservice: CartService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.getorderdetail();
  }

  getorderdetail() {
    this.service.getOrderById(this.orderId).subscribe((res: any) => {
      if (res.status == 'successful') {
        this.order_detail = res.data;
        this.order_items = res.data.items;
        console.log('this.order_detail ====', this.order_detail);
      }
    });
  }

  // Print helpers
  private printHtml(htmlContent: string, paperWidth: '58mm' | '80mm' = '80mm'): void {
    const printWindow = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
    if (!printWindow) {
      console.warn('Popup blocked. Allow popups for this site to print.');
      return;
    }

    const style = `
      <style>
        @page { margin: 4mm; }
        html, body { margin:0; padding:0; background:#fff; }
        body { display:flex; justify-content:center; }
        .print-container {
          width: ${paperWidth};
          box-sizing: border-box;
          padding: 3px 8px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.15;
          color: #000;
        }
        table { width:100%; border-collapse:collapse; }
        th, td { padding: 2px 0; text-align:left; vertical-align: top; }
        .text-center { text-align:center; }
        .text-right { text-align:right; }
        .text-left { text-align:left; }
        @media print {
          body { width: ${paperWidth}; }
          .no-print { display:none !important; }
        }
      </style>
    `;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print</title>
          ${style}
        </head>
        <body>
          <div class="print-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for render, then print and close window
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close after printing (some browsers block window.close if not opened by script print)
        setTimeout(() => {
          printWindow.close();
        }, 500);
      }, 200);
    };
  }

  // Print only customer copy; after successful print we clear cart and navigate
  printCustomer(): void {
    const invoiceEl = document.getElementById('customer-copy');
    if (!invoiceEl) {
      console.error('Customer copy element not found');
      return;
    }
    const invoiceHtml = invoiceEl.outerHTML;
    this.printHtml(invoiceHtml, '80mm'); // change to '80mm' if using 80mm paper

    // keep old behaviour: clear cart after some delay (only for customer copy)
    setTimeout(() => {
      this.clearCart();
    }, 3000);
  }

  // Print only KOT (no cart clear / no redirect)
  printKOT(): void {
    const kotEl = document.getElementById('kot');
    if (!kotEl) {
      console.error('KOT element not found');
      return;
    }
    const kotHtml = kotEl.outerHTML;
    this.printHtml(kotHtml, '80mm'); // change to '80mm' if using 80mm paper
  }

  clearCart() {
    // replace alert + keep previous behaviour
    // remove temporary alert and update cart
    // alert('df'); // removed
    this.cartservice.updatecartvalue.next([]);

    // ✅ Redirect to Home
    // this.router.navigate(['/dashboard/home']);
  }
}
