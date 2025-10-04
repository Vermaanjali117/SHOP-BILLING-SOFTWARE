import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../Shared/shared.service';
import { CartService } from '../../../Shared/cart.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { LoaderService } from '../../../Shared/loader.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent implements OnInit, OnDestroy {
  show_product: any[] = [];
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;
  getlistdata: any=[];
  catagory: any;
  catagoryarr: any = [];
  showproduct: any;
  selectedCategory = 'Burger';

  cart: any[] = [];

  constructor(
    public service: SharedService,
    public loader:LoaderService,
    private cartservice: CartService
  ) {}

  ngOnInit(): void {
    this.loader.show()
    this.getlist();
    this.cartservice.showcartdata$.subscribe((data: any) => {
      this.cart = data;
    });
    this.show_product = [...this.getlistdata];
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((searchText) => {
          if (!searchText.trim()) {
            return this.getlistdata;
          }
          return this.getlistdata.filter((item: { name: string }) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
          );
        })
      )
      .subscribe((filtered) => {
        this.showproduct = filtered;
      });
  }

  filteredProducts() {
    this.showproduct = this.getlistdata.filter(
      (p: any) => p.category === this.selectedCategory
    );
    console.log("this.showproduct ========",this.showproduct);
    return this.showproduct;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.showproduct = this.getlistdata;
    } else {
      this.showproduct = this.getlistdata.filter(
        (p: any) => p.category === category
      );
    }
  }

  addToCart(product: any) {
    this.cartservice.addToCart(product);
    this.cartservice.getItemsTotal();
  }

  increaseQuantity(product: any) {
    this.cartservice.increaseQuantity(product);
    this.cartservice.getItemsTotal();
  }

  decreaseQuantity(product: any) {
    this.cartservice.decreaseQuantity(product);
    this.cartservice.getItemsTotal();
  }

  getQuantity(product: any): number {
    const item = this.cart.find((p: any) => p.name === product.name);
    return item ? item.quantity : 0;
  }

  getlist() {
    this.service.getlistpost().subscribe((res: any) => {
      if (res.status == 'success') {
        this.getlistdata = res.data;
       // Extract unique categories
        for (let i = 0; i < this.getlistdata.length; i++) {
          this.catagoryarr.push(this.getlistdata[i].category);
        }
        this.catagory = [...new Set(this.catagoryarr)];

        // Add "All" at the start of categories
        this.catagory.unshift('All');

        // Set default selected category to "All"
        this.selectedCategory = 'All';

        // Show all products by default
        this.showproduct = this.getlistdata;
        console.log("this.showproduct =====",this.showproduct);
      }
    });
    this.loader.hide();
  }
  // called from input box
onSearchChange(event: Event) {
  const input = event.target as HTMLInputElement;  // safe cast
  this.searchSubject.next(input.value);           // push value into subject
}

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }
}
