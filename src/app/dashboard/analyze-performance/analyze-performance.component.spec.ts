import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzePerformanceComponent } from './analyze-performance.component';

describe('AnalyzePerformanceComponent', () => {
  let component: AnalyzePerformanceComponent;
  let fixture: ComponentFixture<AnalyzePerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyzePerformanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyzePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
