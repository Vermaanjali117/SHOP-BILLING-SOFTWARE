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
  whatsappLink: string = '';
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
      (this.branchId && this.branches[this.branchId]) || {
        name: 'THE BELGIQUE BITES CO',
        subtitle: 'Waffles & More',
        address: 'Kanpur',
      };
    console.log('this.adminid ', this.branchId);
    // get order id from route (adjust param name if different)
    this.orderId =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.paramMap.get('orderId');

    const savedLinkOnly = localStorage.getItem('whatsapp_link_only');
    if (savedLinkOnly !== null) {
      this.sendLinkOnly = savedLinkOnly === 'true';
    }

    if (this.orderId) {
      this.loadOrder(this.orderId);
    } else {
      console.warn('No order id in route');
    }
  }

  sendLinkOnly: boolean = true; // Defaults to sending only the clean link

  getPublicBillUrl(): string {
    const origin = window.location.origin;
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const liveDomain = 'https://thebelgiquebites.co.in';
    const baseDomain = isLocal ? liveDomain : origin;
    return `${baseDomain}/public-bill/${this.orderId}`;
  }

  getWhatsAppMessage(): string {
    const billUrl = this.getPublicBillUrl();
    if (this.sendLinkOnly) {
      return billUrl;
    }
    return `Hello! Here is your bill from The Belgique Bites Co 🧇\n${billUrl}`;
  }

  toggleSendLinkOnly(): void {
    this.sendLinkOnly = !this.sendLinkOnly;
    localStorage.setItem('whatsapp_link_only', String(this.sendLinkOnly));
    if (this.order_detail?.phone) {
      this.buildWhatsAppLink(this.order_detail.phone);
    }
  }

  buildWhatsAppLink(phone: string) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return;
    const withCountryCode = `91${cleanPhone.slice(-10)}`;
    const msg = encodeURIComponent(this.getWhatsAppMessage());
    // Use web.whatsapp.com/send so it opens directly in WhatsApp Web (no redirect page)
    this.whatsappLink = `https://web.whatsapp.com/send?phone=${withCountryCode}&text=${msg}`;
  }



  loadOrder(id: string) {
    this.sharedservice.getOrderById(id).subscribe({
      next: (res: any) => {
        const order = res?.order || res?.data || res;
        if (!order) return;

        this.order_detail = order;
        this.order_items = Array.isArray(order.items) ? order.items : [];

        if (order.branchId && this.branches[order.branchId]) {
          this.currentBranch = this.branches[order.branchId];
        }

        // Build WhatsApp link now that we have the phone number
        if (order.phone) {
          this.buildWhatsAppLink(order.phone);
        }

        const discountAmount = Number(order.discountAmount || 0);
        const discountValue = Number(order.discountValue || 0);
        const gstRate = Number(order.gstRate || 5);

        const calculatedSubTotal = this.order_items.reduce(
          (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
          0,
        );

        const discountedSubtotal = Math.max(0, calculatedSubTotal - discountAmount);
        // Inclusive GST (5%) - does not exceed menu price
        const taxableBase = +(discountedSubtotal / (1 + gstRate / 100)).toFixed(2);
        const gstAmount = +(discountedSubtotal - taxableBase).toFixed(2);
        const calculatedGrandTotal = +discountedSubtotal.toFixed(2);

        this.order_detail.grossTotal = calculatedSubTotal;
        this.order_detail.subTotal = calculatedSubTotal;
        this.order_detail.discountAmount = discountAmount;
        this.order_detail.discountValue = discountValue;
        this.order_detail.gstIncluded = true;
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
          /* Safe margins so thermal printer doesn't cut left/right text */
          @page { 
            size: auto; 
            margin: 0mm 4mm; 
          }
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: Arial, 'Segoe UI', Tahoma, sans-serif; 
            color: #000; 
            margin: 0;
            padding: 2px 8px; /* Safe padding from thermal paper edge */
            width: 100%;
          }
          img { display: none !important; }
          .receipt-paper,
          .w-\\[260px\\],
          .w-\\[300px\\] { 
            width: 250px; 
            max-width: 100%;
            margin: 0 auto; 
            padding: 0 4px;
            box-sizing: border-box;
          }
          
          /* Heading */
          h4 { 
            font-size: 15px; 
            margin: 0 0 2px 0; 
            font-weight: 800;
            text-transform: uppercase;
            text-align: center;
          }
          
          p { margin: 1px 0; line-height: 1.2; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-\\[10px\\] { font-size: 10px; }
          .text-\\[11px\\] { font-size: 11px; }
          .text-\\[11\\.5px\\] { font-size: 11.5px; }
          .text-\\[12px\\] { font-size: 11.5px; }
          .text-\\[12\\.5px\\] { font-size: 12px; }
          .text-\\[13px\\] { font-size: 12px; }
          .text-\\[16px\\] { font-size: 15px; }
          .text-\\[18px\\] { font-size: 15px; }
          
          /* Middle Info - strictly left-aligned as shown in bill */
          .invoice-info {
            text-align: left !important;
            margin: 4px 0;
          }
          .invoice-info div {
            text-align: left !important;
            margin: 1px 0;
            line-height: 1.25;
          }
          
          /* Table styling */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 3px 0; 
            table-layout: fixed;
          }
          th { 
            border-bottom: 1px dashed #000; 
            font-size: 11px; 
            padding: 2px 0;
          }
          td { 
            padding: 2px 0; 
            vertical-align: top; 
            font-size: 11.5px;
          }
          .col-item { width: 55%; text-align: left; word-break: break-word; }
          .col-qty  { width: 15%; text-align: center; }
          .col-price{ width: 30%; text-align: right; }
          
          /* Dashed divider line */
          .divider-dashed {
            border-top: 1px dashed #000;
            margin: 4px 0;
            width: 100%;
          }
          
          /* Totals Section */
          .totals-block {
            margin: 3px 0;
          }
          .flex { 
            display: flex; 
            justify-content: space-between; 
            padding: 1px 0;
          }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="receipt-paper">
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
            @page { size: auto; margin: 0mm 4mm; }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 2px 8px; }
            .receipt-paper,
            .w-\\[260px\\],
            .w-\\[300px\\]{ width: 250px; max-width: 100%; margin: 0 auto; padding: 0 4px; box-sizing: border-box; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin: 3px 0; table-layout: fixed; }
            th { border-bottom: 1px dashed #000; padding: 2px 0; font-size: 11px; }
            td { padding: 2px 0; }
            .col-item { width: 75%; text-align: left; word-break: break-word; }
            .col-qty  { width: 25%; text-align: center; }
            .divider-dashed { border-top: 1px dashed #000; margin: 4px 0; width: 100%; }
          </style>
        </head>
        <body>
          <div class="receipt-paper">
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

  copyButtonText: string = 'Copy Link';

  sendOnWhatsApp() {
    if (this.whatsappLink) {
      window.open(this.whatsappLink, 'whatsapp_tab');
    }
  }

  openWhatsAppApp() {
    const phone = this.order_detail?.phone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('No valid customer phone number found on this bill.');
      return;
    }
    const withCountryCode = `91${cleanPhone.slice(-10)}`;
    const msg = encodeURIComponent(this.getWhatsAppMessage());
    // Directly opens WhatsApp Desktop on Windows without any web loading!
    window.location.href = `whatsapp://send?phone=${withCountryCode}&text=${msg}`;
  }

  copyBillLink() {
    const msg = this.getWhatsAppMessage();
    navigator.clipboard.writeText(msg).then(() => {
      this.copyButtonText = '✓ Copied!';
      setTimeout(() => {
        this.copyButtonText = 'Copy Link';
      }, 2500);
    }).catch(() => {
      // Fallback
      prompt('Copy bill link:', msg);
    });
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
