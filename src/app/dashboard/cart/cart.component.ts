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
import { OfferService, Offer } from '../../../Shared/offer.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgSelectModule],
})
export class CartComponent implements OnInit {
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
  paymentMode: any = null;
  overalldata: CartItem[] = [];
  orderType: any = null;
  customerSuggestions: any[] = [];

  // ── Discount (manual) ──
  showDiscountPanel = false;
  discountMode: 'percentage' | 'fixed' | null = null;
  discountValue: number = 0;
  discountAmount: number = 0;
  discountReason: string = '';
  discountApplied: boolean = false;
  computedGrandTotal: number = 0;

  // ── GST ──
  gstIncluded: boolean = true;
  gstRate: number = 5;
  gstAmount: number = 0;

  // ── Offers ──
  showOfferPanel = false;
  activeOffers: Offer[] = [];
  isLoadingOffers = false;
  selectedOffer: Offer | null = null; // offer applied to current bill

  constructor(
    private router: Router,
    public service: CartService,
    private sharedservice: SharedService,
    private route: ActivatedRoute,
    public loader: LoaderService,
    public toast: ToastrService,
    private offerService: OfferService,
  ) {}

  ngOnInit(): void {
    this.service.showcartdata$.subscribe((res: any) => {
      this.overalldata = Array.isArray(res) ? res : [];
      this.showcartcount = this.overalldata.length;
      this.computeDiscountPreview();
      this.recalculateComputedTotal();
    });

    if (!this.paymentMode) this.paymentMode = 'Cash';
    if (!this.orderType) this.orderType = 'Dine';
    this.loadActiveOffers();
  }

  selectPaymentMode(mode: string): void {
    this.paymentMode = mode;
  }

  selectOrderType(type: string): void {
    this.orderType = type;
  }

  // ─────────────────────────────────────────────
  // OFFER PANEL
  // ─────────────────────────────────────────────

  toggleOfferPanel(): void {
    this.showOfferPanel = !this.showOfferPanel;
    // close manual discount panel if open
    if (this.showOfferPanel) {
      this.showDiscountPanel = false;
      this.loadActiveOffers();
    }
  }

  loadActiveOffers(): void {
    this.isLoadingOffers = true;
    this.offerService.getActiveOffers().subscribe({
      next: (res) => {
        this.activeOffers =
          res && Array.isArray(res.offers)
            ? res.offers.filter((o) => o && o.isActive !== false)
            : [];
        this.isLoadingOffers = false;
      },
      error: () => {
        this.isLoadingOffers = false;
        this.activeOffers = [];
      },
    });
  }

  selectAndApplyOffer(offer: Offer): void {
    this.selectedOffer = offer;
    const base = this.computeBaseTotal();

    if (offer.discountType === 'PERCENT') {
      this.discountAmount = +(base * (offer.discountValue / 100)).toFixed(2);
      this.discountMode = 'percentage';
      this.discountValue = offer.discountValue;
    } else {
      this.discountAmount = +Math.min(offer.discountValue, base).toFixed(2);
      this.discountMode = 'fixed';
      this.discountValue = offer.discountValue;
    }

    this.discountReason = offer.name;
    this.discountApplied = true;
    this.showOfferPanel = false;
    this.recalculateComputedTotal();
    this.toast.success(`"${offer.name}" applied!`);
  }

  removeOffer(): void {
    this.selectedOffer = null;
    this.clearDiscountPreview();
  }

  // ─────────────────────────────────────────────
  // MANUAL DISCOUNT
  // ─────────────────────────────────────────────

  toggleDiscountPanel() {
    // if an offer is already applied, don't open manual panel
    if (this.selectedOffer) {
      this.toast.warning('Remove the applied offer first');
      return;
    }
    this.showDiscountPanel = !this.showDiscountPanel;
    if (!this.showDiscountPanel && !this.discountApplied) {
      this.clearDiscountPreview();
    }
  }

  onDiscountInputChange() {
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
      this.discountReason = 'Manual discount';
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
    this.selectedOffer = null;
    this.recalculateComputedTotal();
  }

  // ─────────────────────────────────────────────
  // TOTALS
  // ─────────────────────────────────────────────

  private computeBaseTotal(): number {
    if (!this.overalldata || this.overalldata.length === 0) return 0;
    return this.overalldata.reduce((sum: number, it: CartItem) => {
      return (
        sum + Number((it as any).quantity || 0) * Number((it as any).price || 0)
      );
    }, 0);
  }

  public get baseTotal(): number {
    return this.computeBaseTotal();
  }

  recalculateComputedTotal() {
    const base = this.computeBaseTotal();
    const discount = this.discountApplied ? this.discountAmount : 0;
    const subtotalAfterDiscount = Math.max(0, base - discount);

    // GST (5%) is inclusive in menu price — grand total equals discounted menu price
    const taxableBase = +(subtotalAfterDiscount / (1 + this.gstRate / 100)).toFixed(2);
    this.gstAmount = +(subtotalAfterDiscount - taxableBase).toFixed(2);
    this.computedGrandTotal = +subtotalAfterDiscount.toFixed(2);
  }

  // ─────────────────────────────────────────────
  // CREATE INVOICE
  // ─────────────────────────────────────────────

  CreateInvoice() {
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
        itemid: item._id,
      }),
    );

    const subTotal = items.reduce((s, it) => s + it.total, 0);
    const discountAmount = this.discountApplied ? this.discountAmount : 0;
    const discountedSubtotal = Math.max(0, subTotal - discountAmount);

    // GST (5%) is inclusive in menu price
    const taxableBase = +(discountedSubtotal / (1 + this.gstRate / 100)).toFixed(2);
    const gstAmount = +(discountedSubtotal - taxableBase).toFixed(2);
    const grandTotal = +discountedSubtotal.toFixed(2);

    const newOrder: any = {
      orderNumber: 'INV-' + Date.now(),
      date: new Date(),
      customerName: this.customerName,
      phone: this.customerPhone,
      paymentMode: this.paymentMode,
      ordertype: this.orderType,
      items,
      subTotal: discountedSubtotal,
      handling: 0,
      grandTotal,
      discountAmount,
      discountType: this.discountApplied ? this.discountMode : null,
      discountValue: this.discountApplied ? this.discountValue : 0,
      discountReason: this.discountApplied ? this.discountReason : null,
      gstIncluded: this.gstIncluded,
      gstRate: this.gstRate,
      gstAmount,
      // offer fields — null if manual discount was used
      appliedOfferId: this.selectedOffer ? this.selectedOffer._id : null,
      appliedOfferName: this.selectedOffer ? this.selectedOffer.name : null,
    };

    this.sharedservice.createorder(newOrder).subscribe(
      (res: any) => {
        this.loader.hide();
        if (res && res.status === 'success') {
          this.toast.success('Invoice Created');
          const order_id = res.order?._id;
          this.router.navigate(['/dashboard', 'bill', order_id]);
        } else {
          this.toast.error(res?.message || 'Failed to create invoice');
        }
        this.customerName = '';
        this.customerPhone = '';
        this.paymentMode = null;
        this.orderType = null;
        this.service.itemtotal = '';
        this.showcartcount = 0;
        this.overalldata = [];
        this.clearDiscountPreview();
        this.service.clearCart();
      },
      (err) => {
        this.loader.hide();
        this.toast.error(err.error?.message || 'Order create failed');
      },
    );
  }

  // ─────────────────────────────────────────────
  // MISC
  // ─────────────────────────────────────────────

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  toggleCart() {
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
  backToDashboard() {
    this.router.navigate(['/dashboard/home']);
  }

  onPhoneInput() {
    const phone = this.customerPhone?.trim();
    if (!phone || phone.length < 3) {
      this.customerSuggestions = [];
      return;
    }
    if (phone.length < 10) {
      this.searchCustomerByPhone(phone);
    }
    if (phone.length === 10) {
      this.fetchCustomerByExactPhone(phone);
    }
  }

  fetchCustomerByExactPhone(phone: string) {
    this.sharedservice.getCustomerByPhone(phone).subscribe({
      next: (res: any) => {
        if (res?.customer) {
          this.customerName = res.customer.customerName;
          this.customerSuggestions = [];
        }
      },
      error: () => {
        this.customerName = '';
      },
    });
  }

  selectCustomer(cust: any) {
    this.customerPhone = cust.phone;
    this.customerName = cust.name;
    this.customerSuggestions = [];
  }

  searchCustomerByPhone(phone: string) {
    this.sharedservice.searchCustomer(phone).subscribe((res: any) => {
      this.customerSuggestions = res || [];
    });
  }
}
