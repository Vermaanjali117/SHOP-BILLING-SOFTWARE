import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../Shared/loader.service';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
  standalone: true, // ✅ standalone
  imports: [AgGridModule, FormsModule, CommonModule], // ✅ put AgGridModule here
})
export class CustomerComponent implements OnInit {
  order_detail: any = [];
  order_items: any = [];
  showbillreciept: boolean = false;
  allowedDeleteBranchId = '695755832c76b65a570b1abb';
  currentBranchId: string | null = null;

  constructor(
    public service: SharedService,
    public loader: LoaderService,
    public toast: ToastrService,
  ) {}
  columnDefs: any;
  orderlist: any = [];
  rowData: any = [];

  ngOnInit(): void {
    this.currentBranchId = localStorage.getItem('admin');
    this.loader.show();
    this.service.getbilllist().subscribe((res: any) => {
      this.orderlist = res.orders;
      this.getorderlist();
    });
    this.loader.hide();
  }
  getorderlist() {
    console.log('orderlist ====', this.orderlist);
    this.columnDefs = [
      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
      },

      { headerName: 'Order No.', field: 'orderNumber' },
      { headerName: 'Token', field: 'tokenNumber' },
      {
        headerName: 'Date',
        field: 'date',
      },
      { headerName: 'Customer Name', field: 'customerName' },
      { headerName: 'Phone', field: 'phone' },
      { headerName: 'Payment Mode', field: 'paymentMode' },
      { headerName: 'Order Type', field: 'ordertype' },
      { headerName: 'Grand Total', field: 'grandTotal' },
      {
        headerName: 'Bill Receipt',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.className =
            'delete-btn text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded-md transition-colors duration-200';
          button.innerHTML = `
 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12c-2.21 0-4-1.79-4-4s1.79-4 
             4-4 4 1.79 4 4-1.79 4-4 4z"/>
    <circle cx="10" cy="11" r="2"/>
  </svg>
    `;

          // Add click event to call Angular delete function
          button.addEventListener('click', () => {
            this.getorderdetail(params);
          });

          return button;
        },
        width: 100,
        sortable: false,
        filter: false,
      },
      ...(this.currentBranchId === this.allowedDeleteBranchId
        ? [{
            headerName: 'Delete',
            cellRenderer: (params: any) => {
              const button = document.createElement('button');
              button.className =
                'flex items-center justify-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full w-8 h-8 transition';
              button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;

              button.addEventListener('click', () => {
                this.deleteorder(params.data);
              });

              return button;
            },
            width: 100,
            sortable: false,
            filter: false,
          }]
        : []),
    ];
    this.rowData = this.orderlist;
  }

  getorderdetail(params: any) {
    this.showbillreciept = true;
    this.order_detail = params.data;
    this.order_items = params.data.items;
  }

  closeModal() {
    this.showbillreciept = false;
  }
  deleteorder(data: any) {
    this.loader.show();
    alert('Are you sure you want to delete ' + data.orderNumber);
    const id = data._id;
    this.service.deleteorder(id).subscribe((res: any) => {
      this.toast.success(data.orderNumber + ' deleted successfully');
      this.getorderlist();
    });
    this.service.getbilllist().subscribe((res: any) => {
      this.orderlist = res.orders;
      this.getorderlist();
    });
    this.loader.hide();
  }
}
