import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewitemComponent } from './addnewitem.component';

describe('AddnewitemComponent', () => {
  let component: AddnewitemComponent;
  let fixture: ComponentFixture<AddnewitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddnewitemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddnewitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
