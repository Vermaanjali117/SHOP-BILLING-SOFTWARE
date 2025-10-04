import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';

import { LoaderService } from '../../../Shared/loader.service';
declare var $: any;
// import { ColDef } from 'ag-grid-community';
@Component({
  selector: 'app-addnewitem',

  standalone: true,
  templateUrl: './addnewitem.component.html',
  styleUrls: ['./addnewitem.component.css'],
  imports: [CommonModule, AgGridModule, FormsModule],
})
export class AddnewitemComponent implements OnInit {
  // colDefs: ColDef[] = [
  //   { field: 'make', sortable: true, filter: true },
  //   { field: 'model', sortable: true, filter: true },
  //   { field: 'price', sortable: true, filter: true },
  // ];

  // ✅ Row Data
  // rowData = [
  //   { make: 'Toyota', model: 'Celica', price: 35000 },
  //   { make: 'Ford', model: 'Mondeo', price: 32000 },
  //   { make: 'Porsche', model: 'Boxster', price: 72000 },
  // ];

  // Use a boolean property to control the modal's visibility
  isModalOpen: boolean = false;
  gridColumnApi: any;
  gridApi: any;
  getlistdata: any;
  imageurl: any;
  description: any;
  price: any;
  category: any;
  editid: any;
  isEdit: boolean = false;
  name: any;
  selectedImage: any;
  columnDefs: any;
  rowData: any = [];
  selectedFile: any;
  constructor(public service: SharedService,
    public toast: ToastrService,
    public loader: LoaderService
  ) { }
  ngAfterViewInit(): void { }

  ngOnInit(): void {
    this.loader.show()
    this.getlist();
    // You don't need to add event listeners here.
    // The modal visibility will be controlled by the 'isModalOpen' property.
  }

  // Method to open the modal
  openModal() {
    this.isModalOpen = true;
    this.isEdit = false;
    this.name = '';
    this.category = '';
    this.price = '';
    this.description = '';
  }

  // Method to close the modal
  closeModal() {
    this.isModalOpen = false;
  }
  onSubmit(form: any) {
    // Clear any previous error messages


    if (form.invalid) {
      alert("Please fill all required feilds")
      console.log("Form is invalid. Marking all controls as touched.");
      if (form.controls) {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
      return;
    }
    this.loader.show();
    console.log('this.isEdit ===', this.isEdit);
    if (this.isEdit) {
      // var obj = {
      //   name: form.value.name,
      //   category: form.value.category,
      //   price: form.value.price,
      //   description: form.value.description,
      //   _id: this.editid,
      //   image_url: this.selectedFile,
      // };
      const formData = new FormData();
      formData.append('name', form.value.name);
      formData.append('category', form.value.category);
      formData.append('price', form.value.price);
      formData.append('description', form.value.description);
      formData.append('_id', this.editid);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.service.edititem(formData).subscribe((res: any) => {
        if (res.status == 'Success') {
          this.toast.success(form.value.name + " edited successfully")
          this.getlist()
          this.loader.hide();
          form.reset();
          // Close the modal after a successful submission
          this.closeModal();
        }
      });
    } else {
      // var obj2 = {
      //   name: form.value.name,
      //   category: form.value.category,
      //   price: form.value.price,
      //   description: form.value.description,
      //   image_url: this.selectedFile,
      // };
      const formData = new FormData();
      formData.append('name', form.value.name);
      formData.append('category', form.value.category);
      formData.append('price', form.value.price);
      formData.append('description', form.value.description);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.service.addpost(formData).subscribe((res: any) => {
        if (res.status == 'Success') {
          this.toast.success(form.value.name + " added successfully")
          this.getlist()
          this.loader.hide();
          form.reset();
          // Close the modal after a successful submission
          this.closeModal();
        }
      });
    }
  }

  getlist() {
    this.service.getlistpost().subscribe((res: any) => {
      if (res.status == 'success') {
        this.getlistdata = res.data;
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
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
        // pinned: 'left',
      },
      { headerName: 'Name', field: 'name' },
      { headerName: 'Category', field: 'category' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Price', field: 'price' },
      {
        headerName: 'Image',
        field: 'image', // this should be the URL stored in your database
        cellRenderer: (data: any) => {
          if (data.data.image) {
            return `<img src="${data.data.image}" style="height:50px;width:50px;object-fit:cover;" />`;
          }
          return '';
        },
      },

      {
        headerName: 'Edit',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.className =
            'flex items-center justify-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full w-8 h-8 transition';
          button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path d="M11 4h2M4 11v2m16-2v2M7 7l10 10" />
      </svg>
    `;

          // Add click event
          button.addEventListener('click', () => {
            this.getEditdata(params.data);
          });

          return button;
        },
        width: 100,
        sortable: false,
        filter: false,
      },

      {
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

          // Add click event to call Angular delete function
          button.addEventListener('click', () => {
            this.deletemenuitem(params.data);
          });

          return button;
        },
        width: 100,
        sortable: false,
        filter: false,
      },
    ];
    this.rowData = this.getlistdata;
  }

  getEditdata(data: any) {
    console.log('data ', data);
    this.isEdit = true;
    this.name = data.name;
    this.category = data.category;
    this.price = data.price;
    this.description = data?.description;
    this.isModalOpen = true;
    this.editid = data._id;
    this.imageurl = data.image;
    this.editid = data._id;
  }
  deletemenuitem(data: any) {
    this.loader.show()
    alert('Are you sure you want to delete ' + data.name);
    const id = data._id;
    this.service.deletemenuitem(id).subscribe((res: any) => {
      console.log('res', res);
      this.getlist();
    });
    this.loader.hide()
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onQuickFilterChanged(event: any) {
    this.gridApi.setQuickFilter(event.target.value);
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    // Optional: preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}
