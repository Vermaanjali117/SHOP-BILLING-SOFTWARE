import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../../Shared/loader.service';

@Component({
  selector: 'app-inventory-history',
  templateUrl: './inventory-history.component.html',
  styleUrls: ['./inventory-history.component.css'],
  imports: [CommonModule, AgGridModule, FormsModule],
  standalone: true,
})
export class InventoryHistoryComponent implements OnInit {
  columnDefs: any = [];
  rowData: any = [];
  selectedIds: any = [];
  getlistdata: any = [];
  fromDate: string = '';
  toDate: string = '';
  rowClassRules: any;
  gridApi: any;
  gridColumnApi: any;
  constructor(
    public service: SharedService,
    public toast: ToastrService,
    public loader: LoaderService
  ) {}
  ngOnInit(): void {
    this.getlist();
  }

  getlist() {
    this.service.getinventoryhistory().subscribe((res: any) => {
      if (res.status == 'success') {
        this.getlistdata = res.history;
        // setTimeout(() => {
        //   $('#myTable').DataTable();
        // }, 1000);
        this.getaddedittable();
      }
    });
    this.loader.hide();
  }
  getaddedittable() {
    this.columnDefs = [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50,
      },

      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
      },

      {
        headerName: 'Raw Material',
        valueGetter: (p: any) => p.data.rawMaterialId?.name || '-',
        sortable: true,
        filter: true,
        flex: 2,
       
   
        
        headerClass: 'ps-3', 
      },

      {
        headerName: 'Change',
        valueGetter: (p: any) => {
          const c = p.data.change;
          const unit = p.data.rawMaterialId?.unit || '';
          return `${c > 0 ? '+' : ''}${c} ${unit}`;
        },
        cellClass: (p: any) => (p.data.change > 0 ? 'stock-in' : 'stock-out'),
        flex: 1.2,
      },

      {
        headerName: 'Reason',
        cellRenderer: (p: any) => {
          const r = p.value;

          if (r === 'RESTOCK')
            return `<span class="reason-badge badge-restock">⬆ RESTOCK</span>`;

          if (r === 'ORDER')
            return `<span class="reason-badge badge-order">⬇ ORDER</span>`;

          return `<span class="reason-badge badge-adjust">⚠ ADJUST</span>`;
        },
        field: 'reason',
        flex: 1.2,
      },
      {
        headerName: 'Remaining Material',
        valueGetter: (p: any) => {
          console.log('Raw Material Object:', p.data?.remainingQuantity);
          return p.data?.remainingQuantity || '-';
        },
        sortable: true,
        filter: true,
        flex: 2,
        width:300
      },

      {
        headerName: 'Date',
        valueFormatter: (p: any) => new Date(p.value).toLocaleString(),
        field: 'createdAt',
        flex: 1.8,
      },
      (this.rowClassRules = {
        'row-restock': (params: any) => params.data.reason === 'RESTOCK',

        'row-order': (params: any) => params.data.reason === 'ORDER',

        'row-adjustment': (params: any) => params.data.reason === 'ADJUSTMENT',
      }),
    ];

    this.rowData = this.getlistdata;
  }
  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();

    this.selectedIds = selectedRows.map((row: any) => row._id);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
  deleteByDateRange() {
    var obj = {
      from: this.fromDate,
      to: this.toDate,
    };
    this.service.deletebyRange(obj).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toast.success(res.message);
        this.getlist();
      } else {
        this.toast.warning(res.message);
      }
    });
  }
  deleteInventoryBulk() {
    var obj = {
      ids: this.selectedIds,
    };
    this.service.deleteInBulk(obj).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toast.success(res.message);
        this.getlist();
      } else {
        this.toast.warning(res.message);
      }
    });
  }

  deleteSelected() {}
}
