import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Shared/cart.service';
import { FormsModule } from '@angular/forms';
import { Order, CartItem, OrderItem } from '../orderdetail';
import { SharedService } from '../../../Shared/shared.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoaderService } from '../../../Shared/loader.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgSelectModule],
})
export class LayoutComponent implements OnInit {
  // UI / data
  items = ['Option 1', 'Option 2', 'Option 3'];
  orderTypes: any = [
    { id: 'Dine', value: 'Dine' },
    { id: 'Take Away', value: 'Take Away' },
  ];
  payment_mode: any = [
    { id: 'Cash', value: 'Cash' },
    { id: 'UPI', value: 'UPI' },
    { id: 'Card', value: 'Card' },
  ];

  isSidebarCollapsed = false;
  showcartcount: number = 0;
  isCartOpen: boolean = false;
  customerName: string = '';
  customerPhone: string = '';
  paymentMode: any;
  overalldata: CartItem[] = [];
  orderType: any;

  // Discount: always available since owner uses the POS
  showDiscountPanel = false;
  discountMode: 'percentage' | 'fixed' | null = null;
  discountValue: number = 0; // user input (20 => 20% or 50 => ₹50)
  discountAmount: number = 0; // computed rupee amount (preview)
  discountReason: string = '';
  discountApplied: boolean = false; // true after Apply
  computedGrandTotal: number = 0; // grand total after discount (preview + used when creating order)

  constructor(
    private router: Router,
    public service: CartService,
    private sharedservice: SharedService,
    private route: ActivatedRoute,
    public loader: LoaderService,
    public toast: ToastrService
  ) {}

  ngOnInit(): void {
    // subscribe to cart changes
    this.service.showcartdata$.subscribe((res: any) => {
      this.overalldata = Array.isArray(res) ? res : [];
      this.showcartcount = this.overalldata.length;
      // recompute totals when cart updates
      this.computeDiscountPreview(); // recompute discount preview with new base
      this.recalculateComputedTotal();
    });

    // initialize computed total
    this.recalculateComputedTotal();
  }

  // ---------- UI handlers ----------

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  toggleCart() {
    this.isCartOpen = false;
    this.router.navigateByUrl('/dashboard/cart');
  }
  increaseQuantity(product: any) {
    this.service.increaseQuantity(product);
  }
  decreaseQuantity(product: any) {
    this.service.decreaseQuantity(product);
  }
  closeCart() {
    this.isCartOpen = false;
  }

  // ---------- totals helpers ----------
  // keep computeBaseTotal private, expose a public getter for the template
  private computeBaseTotal(): number {
    if (!this.overalldata || this.overalldata.length === 0) return 0;
    return this.overalldata.reduce((sum: number, it: CartItem) => {
      const qty = Number((it as any).quantity || 0);
      const price = Number((it as any).price || 0);
      return sum + qty * price;
    }, 0);
  }

  // public getter used in template for clean bindings
  public get baseTotal(): number {
    return this.computeBaseTotal();
  }

  recalculateComputedTotal() {
    const base = this.computeBaseTotal();
    const after = base - (this.discountApplied ? this.discountAmount : 0);
    this.computedGrandTotal = +Math.max(0, after).toFixed(2);
  }

  // ---------- discount helpers ----------
  toggleDiscountPanel() {
    this.showDiscountPanel = !this.showDiscountPanel;
    if (!this.showDiscountPanel && !this.discountApplied) {
      // closing without applying -> reset preview
      this.clearDiscountPreview();
    }
  }

  onDiscountInputChange() {
    // compute preview as user types
    this.computeDiscountPreview();
    this.recalculateComputedTotal();
  }

  computeDiscountPreview() {
    const base = this.computeBaseTotal();
    if (!this.discountMode || !this.discountValue || base <= 0) {
      this.discountAmount = 0;
      return;
    }

    if (this.discountMode === 'percentage') {
      this.discountAmount = +(
        base *
        (Number(this.discountValue) / 100)
      ).toFixed(2);
    } else {
      this.discountAmount = +Number(this.discountValue).toFixed(2);
    }

    if (this.discountAmount > base) this.discountAmount = base;
    this.recalculateComputedTotal();
  }

  applyDiscountToPreview() {
    this.computeDiscountPreview();
    if (this.discountAmount > 0) {
      this.discountApplied = true;
      this.showDiscountPanel = false;
    } else {
      this.discountApplied = false;
    }
    this.recalculateComputedTotal();
  }

  clearDiscountPreview() {
    this.discountMode = null;
    this.discountValue = 0;
    this.discountAmount = 0;
    this.discountReason = '';
    this.discountApplied = false;
    this.recalculateComputedTotal();
  }

  // ---------- Create invoice (sends discount fields to server) ----------
  CreateInvoice() {
    // basic front-end validation (button disabled too)
    if (
      !this.customerName ||
      !this.customerPhone ||
      !this.paymentMode ||
      !this.orderType
    ) {
      this.toast.error('Please fill required fields');
      return;
    }

    this.loader.show();
    const items: OrderItem[] = (this.overalldata || []).map(
      (item: CartItem) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })
    );

    const subTotal = items.reduce((s, it) => s + it.total, 0);
    const handling = 0;
    const grandTotal = this.discountApplied
      ? this.computedGrandTotal
      : subTotal + handling;

    // cast to any to avoid TS issues if your Order type doesn't include discount fields
    const newOrder: any = {
      orderNumber: 'INV-' + Date.now(),
      date: new Date(),
      customerName: this.customerName,
      phone: this.customerPhone,
      paymentMode: this.paymentMode,
      ordertype: this.orderType,
      items,
      subTotal,
      handling,
      grandTotal,
      discountAmount: this.discountApplied ? this.discountAmount : 0,
      discountType: this.discountApplied ? this.discountMode : null,
      discountValue: this.discountApplied ? this.discountValue : 0,
      discountReason: this.discountApplied ? this.discountReason : null,
    };

    this.sharedservice.createorder(newOrder).subscribe(
      (res: any) => {
        this.loader.hide();
        if (res && res.status === 'success') {
          this.toast.success('Invoice Created');
          this.toggleCart();
          const order_id = res.order?._id;
          this.router.navigate(['bill', order_id], { relativeTo: this.route });
        } else {
          this.toast.error(res?.message || 'Failed to create invoice');
        }

        // reset UI
        this.customerName = '';
        this.customerPhone = '';
        this.paymentMode = '';
        this.orderType = '';
        this.service.itemtotal = '';
        this.showcartcount = 0;
        this.overalldata = [];
        this.clearDiscountPreview();
      },
      (err) => {
        this.loader.hide();
        this.toast.error(err.error?.message || 'Order create failed');
      }
    );
  }
logout() {
  this.loader.show();

  this.sharedservice.logout().subscribe({
    next: (res: any) => {
      console.log(res);
    

      // clear frontend state if any
      localStorage.clear();
 this.router.navigateByUrl('/login');
      // redirect to login
      // this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error(err);
    
    },
    complete: () => {
      this.loader.hide(); // 🔥 hide AFTER response
    }
  });
}

}
