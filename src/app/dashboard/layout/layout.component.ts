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
  imports: [RouterModule, CommonModule, FormsModule, NgSelectModule,],
})
export class LayoutComponent implements OnInit {
  items = ['Option 1', 'Option 2', 'Option 3'];
  orderTypes:any=[{
    id:'Dine',value:'Dine'
  },
  {
    id:'Take Away',value:'Take Away'
  },
]
payment_mode:any=[
  {
    id:'Cash',value:'Cash'
  },
  {
    id:'UPI',value:'UPI'
  },
   {
    id:'Card',value:'Card'
  },
]
selectedItem: any;
  isSidebarCollapsed = false;
  cart: any;
  showcartcount: any;
  isCartOpen: boolean = false;
  customerName: any;
  customerPhone: any;
  paymentMode: any;
  overalldata: any;
  itemtotal: any;
orderType:any;
  constructor(
    private router: Router,
    public service: CartService,
    private sharedservice: SharedService,
    private route: ActivatedRoute,
    public loader:LoaderService,
    public toast:ToastrService
  ) {}

  ngOnInit(): void {
    this.service.showcartdata$.subscribe((res:any)=>{
      this.showcartcount = res?.length;
      this.overalldata = res;
    });
  }
  logout() {
    // Clear token / session storage
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
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
  CreateInvoice() {
    this.loader.show();
    const items: OrderItem[] = this.overalldata.map((item: CartItem) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
      total: item.price * item.quantity,


    }));
    const subTotal = items.reduce((sum, i) => sum + i.total, 0);
    const handling = 0;
    const grandTotal = subTotal + handling;

    const newOrder: Order = {
      orderNumber: 'INV-' + Date.now(),
      date: new Date(),
      customerName: this.customerName,
      phone: this.customerPhone,
      paymentMode: this.paymentMode,
      ordertype:this.orderType,
      items,
      subTotal,
      handling,
      grandTotal,
    };

    this.sharedservice.createorder(newOrder).subscribe((res:any)=>{
      const order_id = res.order._id;
      if (res.status == 'success') {
        this.loader.hide();
        this.toast.success("Invoice Created")
        this.toggleCart();
        this.router.navigate(['bill', order_id], { relativeTo: this.route });
      }
      this.customerName = '';
      this.customerPhone = '';
      this.paymentMode = '';
      this.service.itemtotal = '';
      this.service.itemtotal = '';
      this.showcartcount = '';
      this.overalldata = '';
    });
    this.overalldata=''
  }
}
