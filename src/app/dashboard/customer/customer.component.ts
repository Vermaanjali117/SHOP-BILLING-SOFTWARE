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

  // Edit Bill State
  showEditBillModal: boolean = false;
  editOrderData: any = null;
  editForm: { customerName: string; phone: string; paymentMode: string } = {
    customerName: '',
    phone: '',
    paymentMode: 'Cash',
  };
  isSavingEdit: boolean = false;

  // Search & Filter State
  gridApi: any;
  searchTerm: string = '';
  selectedPaymentFilter: string = 'All';

  defaultColDef: any = {
    resizable: true,
    sortable: true,
  };

  constructor(
    public service: SharedService,
    public loader: LoaderService,
    public toast: ToastrService,
  ) { }
  columnDefs: any;
  orderlist: any = [];
  rowData: any = [];

  ngOnInit(): void {
    this.fetchOrders();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  fetchOrders() {
    this.loader.show();
    this.service.getbilllist().subscribe({
      next: (res: any) => {
        this.orderlist = res.orders || [];
        this.getorderlist();
        this.applyFilter();
        this.loader.hide();
      },
      error: (err: any) => {
        this.loader.hide();
        console.error('Error fetching order list:', err);
      },
    });
  }

  applyFilter() {
    let filtered = [...this.orderlist];

    // Filter by Payment Mode
    if (this.selectedPaymentFilter && this.selectedPaymentFilter !== 'All') {
      filtered = filtered.filter(
        (o) => (o.paymentMode || '').toLowerCase() === this.selectedPaymentFilter.toLowerCase()
      );
    }

    // Filter by Search Query
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((order: any) => {
        const name = (order.customerName || '').toLowerCase();
        const phone = (order.phone || '').toLowerCase();
        const orderNo = (order.orderNumber || '').toLowerCase();
        const token = String(order.tokenNumber || '');
        const payMode = (order.paymentMode || '').toLowerCase();
        const orderType = (order.ordertype || '').toLowerCase();
        const total = String(order.grandTotal || '');
        let dateStr = '';
        if (order.date) {
          const d = new Date(order.date);
          dateStr = (
            d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' +
            d.toLocaleDateString('en-IN') +
            ' ' +
            d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
          ).toLowerCase();
        }

        return (
          name.includes(term) ||
          phone.includes(term) ||
          orderNo.includes(term) ||
          token.includes(term) ||
          payMode.includes(term) ||
          orderType.includes(term) ||
          total.includes(term) ||
          dateStr.includes(term)
        );
      });
    }

    this.rowData = filtered;

    if (this.gridApi && typeof this.gridApi.setQuickFilter === 'function') {
      this.gridApi.setQuickFilter(this.searchTerm);
    }
  }

  getPaymentCount(mode: string): number {
    if (!this.orderlist || !this.orderlist.length) return 0;
    return this.orderlist.filter(
      (o: any) => (o.paymentMode || '').trim().toLowerCase() === mode.toLowerCase()
    ).length;
  }

  setPaymentFilter(mode: string) {
    this.selectedPaymentFilter = mode;
    this.applyFilter();
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedPaymentFilter = 'All';
    this.applyFilter();
  }

  getorderlist() {
    this.columnDefs = [
      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
      },

      { headerName: 'Order No.', field: 'orderNumber', width: 165 },
      { headerName: 'Token', field: 'tokenNumber', width: 85 },
      {
        headerName: 'Date',
        field: 'date',
        valueFormatter: (params: any) => {
          if (!params.value) return '-';
          const d = new Date(params.value);
          if (isNaN(d.getTime())) return params.value;
          return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        },
        comparator: (valueA: any, valueB: any) => {
          return new Date(valueA).getTime() - new Date(valueB).getTime();
        },
        width: 120,
      },
      {
        headerName: 'Time',
        field: 'date',
        valueFormatter: (params: any) => {
          if (!params.value) return '-';
          const d = new Date(params.value);
          if (isNaN(d.getTime())) return '-';
          return d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        },
        comparator: (valueA: any, valueB: any) => {
          return new Date(valueA).getTime() - new Date(valueB).getTime();
        },
        width: 105,
      },
      { headerName: 'Customer Name', field: 'customerName', width: 140 },
      { headerName: 'Phone', field: 'phone', width: 125 },
      {
        headerName: 'Payment Mode',
        field: 'paymentMode',
        cellRenderer: (params: any) => {
          const mode = (params.value || '').trim();
          const span = document.createElement('span');
          span.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold';

          if (mode.toLowerCase() === 'cash') {
            span.className += ' bg-emerald-50 text-emerald-700 border border-emerald-200';
            span.innerHTML = `<span>💵</span><span>Cash</span>`;
          } else if (mode.toLowerCase() === 'upi') {
            span.className += ' bg-purple-50 text-purple-700 border border-purple-200';
            span.innerHTML = `<span>📱</span><span>UPI</span>`;
          } else if (mode.toLowerCase() === 'card') {
            span.className += ' bg-blue-50 text-blue-700 border border-blue-200';
            span.innerHTML = `<span>💳</span><span>Card</span>`;
          } else {
            span.className += ' bg-gray-50 text-gray-700 border border-gray-200';
            span.textContent = mode || '-';
          }
          return span;
        },
        width: 125,
      },
      {
        headerName: 'Order Type',
        field: 'ordertype',
        cellRenderer: (params: any) => {
          const type = (params.value || '').trim();
          const span = document.createElement('span');
          span.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium';

          if (type.toLowerCase() === 'dine') {
            span.className += ' bg-amber-50 text-amber-800 border border-amber-200';
            span.innerHTML = `<span>🍽️</span><span>Dine</span>`;
          } else {
            span.className += ' bg-orange-50 text-orange-800 border border-orange-200';
            span.innerHTML = `<span>🛍️</span><span>Take Away</span>`;
          }
          return span;
        },
        width: 120,
      },
      {
        headerName: 'Grand Total',
        field: 'grandTotal',
        cellRenderer: (params: any) => {
          const span = document.createElement('span');
          span.className = 'font-bold text-[#2C1810]';
          const val = params.value !== undefined && params.value !== null ? Number(params.value).toFixed(2) : '0.00';
          span.textContent = '₹ ' + val;
          return span;
        },
        width: 120,
      },
      {
        headerName: 'Receipt',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.title = 'View Receipt';
          button.className =
            'flex items-center justify-center text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg w-7 h-7 transition shadow-2xs cursor-pointer';
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          `;
          button.addEventListener('click', () => {
            this.getorderdetail(params);
          });
          return button;
        },
        width: 85,
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Edit',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.title = 'Edit Bill (Name, Phone, Payment)';
          button.className =
            'flex items-center justify-center text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-lg w-7 h-7 transition shadow-2xs cursor-pointer';
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          `;
          button.addEventListener('click', () => {
            this.openEditModal(params.data);
          });
          return button;
        },
        width: 80,
        sortable: false,
        filter: false,
      },
      {
        headerName: 'Delete',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.title = 'Delete Order';
          button.className =
            'flex items-center justify-center text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg w-7 h-7 transition shadow-2xs cursor-pointer';
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          `;
          button.addEventListener('click', () => {
            this.deleteorder(params.data);
          });
          return button;
        },
        width: 80,
        sortable: false,
        filter: false,
      },
    ];
    this.applyFilter();
  }

  getorderdetail(params: any) {
    this.showbillreciept = true;
    this.order_detail = params.data;
    this.order_items = params.data.items || [];
  }

  closeModal() {
    this.showbillreciept = false;
  }

  // Open Edit Bill Modal
  openEditModal(order: any) {
    if (!order) return;
    this.editOrderData = order;
    this.editForm = {
      customerName: order.customerName || '',
      phone: order.phone || '',
      paymentMode: order.paymentMode || 'Cash',
    };
    this.showEditBillModal = true;
  }

  closeEditModal() {
    this.showEditBillModal = false;
    this.editOrderData = null;
    this.isSavingEdit = false;
  }

  // Save Bill Edit (Customer Name, Phone, and Payment Mode editable; rest frozen)
  saveBillEdit() {
    if (!this.editOrderData || !this.editOrderData._id) {
      return;
    }

    if (!this.editForm.phone || !this.editForm.phone.trim()) {
      this.toast.warning('Please enter a phone number');
      return;
    }

    this.isSavingEdit = true;
    this.loader.show();

    const payload = {
      customerName: (this.editForm.customerName || '').trim(),
      phone: (this.editForm.phone || '').trim(),
      paymentMode: this.editForm.paymentMode,
    };

    this.service.updateOrder(this.editOrderData._id, payload).subscribe({
      next: (res: any) => {
        this.toast.success('Bill updated successfully');
        this.isSavingEdit = false;
        this.loader.hide();

        // Update receipt modal if it was open for this order
        if (this.order_detail && this.order_detail._id === this.editOrderData._id) {
          this.order_detail.customerName = payload.customerName;
          this.order_detail.phone = payload.phone;
          this.order_detail.paymentMode = payload.paymentMode;
        }

        this.closeEditModal();
        this.fetchOrders();
      },
      error: (err: any) => {
        this.isSavingEdit = false;
        this.loader.hide();
        console.error('Failed to update bill:', err);
        this.toast.error(err?.error?.message || 'Failed to update bill');
      },
    });
  }

  deleteorder(data: any) {
    if (!confirm('Are you sure you want to delete ' + data.orderNumber + '?')) {
      return;
    }
    this.loader.show();
    const id = data._id;
    this.service.deleteorder(id).subscribe({
      next: (res: any) => {
        this.toast.success(data.orderNumber + ' deleted successfully');
        this.fetchOrders();
      },
      error: (err: any) => {
        this.loader.hide();
        console.error('Delete error:', err);
        this.toast.error(err?.error?.message || 'Failed to delete order');
      },
    });
  }
}
