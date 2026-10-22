import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../../Shared/shared.service';
import { Location, CommonModule } from '@angular/common';
import { CartService } from '../../../Shared/cart.service';
@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class BillComponent implements OnInit {
  currentBranch: any = {};
  branchId: any;
  // Define your branch details here
  branches: any = {
    '695755832c76b65a570b1abb': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Annpurna Enterprise',
      address: '51-A Chandranagar Charari Lal Banglow, Kanpur - 208007',
    },
    '695755902c76b65a570b1abd': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Riddhi Enterprises',
      address: 'Gooba Garden Crossing, Metro pillor no -16 IIT kanpur',
    },
        '6ada3835c258ef239e98357e': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Simran Enterprises',
      address: ' Benajhabar Rd, Motilal Swaroop Nagar, Harsh Nagar kanpur',
    },
        '6ada3997ac5a9079479c08f8': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'test Enterprises',
      address: 'test branch IIT kanpur',
    },
  };
  orderId: string | null = null;
  adminid: any;
  order_detail: any = {
    orderNumber: '',
    tokenNumber: '',
    date: new Date(),
    customerName: '',
    phone: '',
    paymentMode: '',
    ordertype: '',
    items: [],
    subTotal: 0,
    handling: 0,
    grandTotal: 0,
    discountAmount: 0,
    discountType: null,
    discountValue: 0,
    discountReason: null,
    gstIncluded: true,
    gstRate: 5,
    gstAmount: 0,
  };
  order_items: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private sharedservice: SharedService,
    private location: Location,
    private router: Router,
    public cartservice: CartService,
  ) {}

  ngOnInit(): void {
    this.branchId = localStorage.getItem('admin');
    this.currentBranch =
      this.branches[this.branchId] || this.branches['BRANCH_ID_1'];
    console.log('this.adminid ', this.branchId);
    // get order id from route (adjust param name if different)
    this.orderId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('orderId');

    if (this.orderId) {
      this.loadOrder(this.orderId);
    } else {
      // if order is passed some other way, handle it here
      console.warn('No order id in route');
    }
  }

  loadOrder(id: string) {
    this.sharedservice.getOrderById(id).subscribe({
      next: (res: any) => {
        const order = res?.order || res?.data || res;
        if (!order) return;

        this.order_detail = order;
        this.order_items = Array.isArray(order.items) ? order.items : [];

        const discountAmount = Number(order.discountAmount || 0);
        const discountValue = Number(order.discountValue || 0);
        const gstIncluded = order.gstIncluded !== false;
        const gstRate = Number(order.gstRate || 5);

        const calculatedSubTotal = this.order_items.reduce(
          (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
          0,
        );

        const discountedSubtotal = Math.max(0, calculatedSubTotal - discountAmount);
        const gstAmount = gstIncluded ? +((discountedSubtotal * gstRate) / 100).toFixed(2) : 0;
        const calculatedGrandTotal = +(discountedSubtotal + gstAmount).toFixed(2);

        this.order_detail.grossTotal = calculatedSubTotal;
        this.order_detail.subTotal = calculatedSubTotal;
        this.order_detail.discountAmount = discountAmount;
        this.order_detail.discountValue = discountValue;
        this.order_detail.gstIncluded = gstIncluded;
        this.order_detail.gstRate = gstRate;
        this.order_detail.gstAmount = gstAmount;
        this.order_detail.grandTotal = calculatedGrandTotal;

        console.log('Math Check:', {
          gross: this.order_detail.grossTotal,
          discount: this.order_detail.discountAmount,
          gst: this.order_detail.gstAmount,
          net: this.order_detail.grandTotal,
        });
      },
    });
  }

  // helper that returns whether a discount exists
  hasDiscount(): boolean {
    return !!(
      this.order_detail && Number(this.order_detail.discountAmount) > 0
    );
  }

  // formatting helpers (optional)
  formatAmount(n: any): string {
    const v = Number(n || 0);
    return v.toFixed(2);
  }

  // print functions: open a small print window and print the element's innerHTML
  printCustomer() {
    const el = document.getElementById('customer-copy');
    if (!el) {
      alert('Customer copy element not found');
      return;
    }
    const content = el.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=700');
    if (!win) return;

    win.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          /* Reset margins for printing */
          @page { margin: 0; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            color: #000; 
            margin: 10px;
            padding: 0;
          }
          .w-[300px] { width: 280px; margin: 0 auto; }
          
          /* Heading Fix: Force single line and smaller font */
          h4 { 
            font-size: 16px; 
            margin: 0 0 2px 0; 
            white-space: nowrap; 
            font-weight: 800;
            text-transform: uppercase;
          }
          
          /* Tighten spacing */
          p { margin: 1px 0; line-height: 1.2; }
          .text-center { text-align: center; }
          .text-[10px] { font-size: 10px; }
          .text-[11px] { font-size: 11px; }
          .text-[12px] { font-size: 11px; } /* Slightly smaller for better fit */
          
          /* Table styling */
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { border-bottom: 1px dashed #000; text-align: left; font-size: 11px; }
          td { padding: 3px 0; vertical-align: top; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          /* Totals Section */
          .font-bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="w-[300px]">
          ${content}
        </div>
      </body>
    </html>
  `);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 300);

    this.cartservice.clearCart();
    localStorage.removeItem('editingOrder');
  }

  printKOT() {
    const el = document.getElementById('kot');
    if (!el) {
      alert('KOT element not found');
      return;
    }
    const content = el.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=500');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>KOT</title>
          <style>
            body { font-family: Arial, sans-serif; color: #000; }
            .w-[300px]{ width: 300px; margin: 0 auto; }
            .text-center { text-align: center; }
            .text-[12px] { font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            td, th { padding: 4px 0; }
          </style>
        </head>
        <body>
          <div class="w-[300px]">
            ${content}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 300);
  }

  // optional: go back
  back() {
    this.location.back();
  }
  onEdit() {
    localStorage.setItem('editingOrder', JSON.stringify(this.order_detail));
    this.router.navigate(['/dashboard/cart']);
  }
}
