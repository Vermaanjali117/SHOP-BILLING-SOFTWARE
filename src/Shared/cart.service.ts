import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any[] = [];
  itemtotal: any;
  public updatecartvalue = new BehaviorSubject<any[]>([]);
  showcartdata$ = this.updatecartvalue.asObservable();

  constructor() {}

  private notify() {
    this.updatecartvalue.next([...this.cart]);
  }

  addToCart(product: any) {
    const existing = this.cart.find((p) => p.name === product.name);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.notify();
    this.getItemsTotal();
  }

  increaseQuantity(product: any) {
    const item = this.cart.find((p) => p.name === product.name);
    if (item) item.quantity++;
    this.notify();
    this.getItemsTotal();
  }

  decreaseQuantity(product: any) {
    const item = this.cart.find((p) => p.name === product.name);
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.cart = this.cart.filter((p) => p.name !== product.name);
      }
    }
    this.notify();
    this.getItemsTotal();
  }
  getItemsTotal() {
    this.itemtotal = this.cart.reduce(
      (acc: number, item: { price: number; quantity: number }) =>
        acc + item.price * item.quantity,
      0
    );
    console.log('this.itemtotal ===', this.itemtotal);
  }
}
