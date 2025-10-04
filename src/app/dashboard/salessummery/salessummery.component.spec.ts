import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalessummeryComponent } from './salessummery.component';

describe('SalessummeryComponent', () => {
  let component: SalessummeryComponent;
  let fixture: ComponentFixture<SalessummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalessummeryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalessummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
