import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapchartComponent } from './heatmapchart.component';

describe('HeatmapchartComponent', () => {
  let component: HeatmapchartComponent;
  let fixture: ComponentFixture<HeatmapchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeatmapchartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatmapchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
