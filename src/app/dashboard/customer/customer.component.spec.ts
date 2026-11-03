import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { CustomerComponent } from './customer.component';
import { SharedService } from '../../../Shared/shared.service';
import { LoaderService } from '../../../Shared/loader.service';
import { ExcelExportService } from '../../../Shared/excel-export.service';

describe('CustomerComponent', () => {
  let component: CustomerComponent;
  let fixture: ComponentFixture<CustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        {
          provide: SharedService,
          useValue: {
            getbilllist: () => of({ orders: [] }),
          },
        },
        {
          provide: LoaderService,
          useValue: {
            show: () => {},
            hide: () => {},
          },
        },
        {
          provide: ExcelExportService,
          useValue: {
            exportSalesOrders: () => {},
          },
        },
        ToastrService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the export action visible even when there are no records', () => {
    component.orderlist = [];
    component.rowData = [];
    fixture.detectChanges();

    const exportButton = fixture.nativeElement.querySelector('button[title="Export Sales to Excel (.xlsx)"]');
    expect(exportButton).toBeTruthy();
    expect(exportButton.disabled).toBeFalse();
    expect(exportButton.textContent).toContain('Export Excel');
  });
});
