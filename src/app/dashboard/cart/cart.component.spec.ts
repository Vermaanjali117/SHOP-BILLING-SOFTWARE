import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: 'CartService', useValue: { showcartdata$: of([]), itemtotal: 0, clearCart: jasmine.createSpy('clearCart') } },
        { provide: 'SharedService', useValue: { createorder: jasmine.createSpy('createorder').and.returnValue(of({ status: 'success', order: { _id: '123' } })) } },
        { provide: 'ActivatedRoute', useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: 'LoaderService', useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success'), warning: jasmine.createSpy('warning') } },
        { provide: 'OfferService', useValue: { getActiveOffers: jasmine.createSpy('getActiveOffers').and.returnValue(of({ offers: [] })) } },
      ],
    }).overrideComponent(CartComponent, {
      set: {
        providers: [
          { provide: 'CartService', useValue: { showcartdata$: of([]), itemtotal: 0, clearCart: jasmine.createSpy('clearCart') } },
          { provide: 'SharedService', useValue: { createorder: jasmine.createSpy('createorder').and.returnValue(of({ status: 'success', order: { _id: '123' } })) } },
          { provide: 'ActivatedRoute', useValue: { snapshot: { paramMap: { get: () => null } } } },
          { provide: 'LoaderService', useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } },
          { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success'), warning: jasmine.createSpy('warning') } },
          { provide: 'OfferService', useValue: { getActiveOffers: jasmine.createSpy('getActiveOffers').and.returnValue(of({ offers: [] })) } },
        ],
      },
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should include GST by default at 5% on the discounted subtotal', () => {
    component.overalldata = [
      { name: 'Burger', price: 100, quantity: 2 },
    ];
    component.discountApplied = true;
    component.discountMode = 'percentage';
    component.discountValue = 10;
    component.discountAmount = 20;

    component.recalculateComputedTotal();

    expect(component.gstIncluded).toBeTrue();
    expect(component.gstAmount).toBe(19); 
    expect(component.computedGrandTotal).toBe(171); 
  });
});
