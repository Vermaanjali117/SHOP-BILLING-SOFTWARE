import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../Shared/loader.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
@Component({
  selector: 'app-row-material',
  templateUrl: './row-material.component.html',
  styleUrls: ['./row-material.component.css'],
  standalone: true,
  imports: [
    AgGridModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule, // Required to wrap the select
    MatSelectModule, // The select component itself
    MatOptionModule,
  ],
})
export class RowMaterialComponent implements OnInit {
  get_row_material: any = [];
  showProduceModal = false;
  selectedPremix: any = null;
  produceQty: number = 1;
  row_material_name: any;
  showProductionModal: boolean = false;
  compositedata: any;
  rowData: any = [];
  columnDefs: any = [];
  showModal = false;
  selectedMaterial: any;
  addStockQty: any;
  showAdjustModal: boolean = false;
  gridApi: any;
  newQuantity: any;
  adjustNote: any;
  addstock_materialid: any;
  ingredients: any[] = [];
  recipeOutputQuantity: number = 1;
  rawMaterials: any[] = [];
  rowmaterial_id: any;
  raw_material_isEdit: boolean = false;
  adjuststock_id: any;
  rawMaterial = {
    name: '',
    unit: '',
    quantity: null,
    alertAt: null,
    type: '',
  };
  showAddStockModal: boolean = false;
  constructor(
    public service: SharedService,
    public loader: LoaderService,
    public toast: ToastrService,
  ) {}
  ngOnInit(): void {
    this.loader.show();
    this.service.getRawMaterial().subscribe((res: any) => {
      this.get_row_material = res.materials;
      console.log('this.get_row_material ====', this.get_row_material);
      this.getRawMateriallist();
    });
    this.loader.hide();
  }
  getRawMateriallist() {
    // Inside getRawMateriallist()
    // Inside row-material.component.ts -> getRawMateriallist()

    this.columnDefs = [
      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 70,
        pinned: 'left', // Optional: keeps index visible
      },
      {
        headerName: 'Material Name',
        field: 'name',
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 150,
      },
      {
        headerName: 'Current Stock',
        valueGetter: (p: any) => {
          const qty = p.data.quantity || 0;
          const unit = p.data.unit ? p.data.unit.toLowerCase() : 'gm';

          // 1. If it's mass/volume >= 1000, convert and fix decimals
          if (
            (unit === 'gm' ||
              unit === 'kg' ||
              unit === 'ml' ||
              unit === 'ltr') &&
            qty >= 1000
          ) {
            const displayQty = (qty / 1000).toFixed(2);
            const displayUnit = unit === 'gm' || unit === 'kg' ? 'kg' : 'ltr';

            // Remove trailing zeros (optional): 11.80 becomes 11.8
            return `${parseFloat(displayQty)} ${displayUnit}`;
          }

          // 2. For smaller quantities, also fix floating point issues
          // This handles cases like 11.800000000000004 gm
          const fixedQty = parseFloat(qty.toFixed(2));
          return `${fixedQty} ${unit}`;
        },
        flex: 1,
        minWidth: 120,
        cellStyle: (p: any) => {
          const isLow = p.data.quantity <= (p.data.alertAt || 0);
          return {
            'font-weight': 'bold',
            color: isLow ? '#dc3545' : 'inherit',
          };
        },
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 120,
        cellRenderer: (params: any) => {
          const type = params.data.type;

          return type === 'COMPOSITE'
            ? `<span class="badge bg-warning text-dark">Composite</span>`
            : `<span class="badge bg-secondary">RAW</span>`;
        },
      },
      {
        headerName: 'Actions',
        flex: 2,
        minWidth: 240,
        cellRenderer: (params: any) => {
          const div = document.createElement('div');
          div.className = 'd-flex gap-2';

          const isComposite = params.data.type === 'COMPOSITE';

          div.innerHTML = `
      <button class="btn btn-sm btn-outline-primary border-0">Edit</button>

      ${
        isComposite
          ? `<button class="btn btn-sm btn-light text-primary">⚙ Produce</button>`
          : `<button class="btn btn-sm btn-light text-success">+ Stock</button>`
      }

      <button class="btn btn-sm btn-light text-warning">Adjust</button>
    `;

          const btns = div.querySelectorAll('button');

          btns[0].onclick = () => this.EditRowMaterial(params.data);

          if (isComposite) {
            btns[1].onclick = () => this.openProduceModal(params.data);
          } else {
            btns[1].onclick = () => this.openAddStockModal(params.data);
          }

          btns[2].onclick = () => this.openAdjustStockModal(params.data);

          return div;
        },
      },
      // Inside getRawMateriallist() -> columnDefs

      {
        headerName: 'Delete',
        width: 80,
        suppressMenu: true,
        sortable: false,
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.className = 'btn-delete-pill';

          // Enterprise SVG Delete Icon
          button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg>
    `;

          button.onclick = () => this.deleteorder(params.data);
          return button;
        },
      },
    ];
    this.rowData = this.get_row_material;
  }
  deleteorder(data: any) {
    console.log('data =====', data);
    this.loader.show();
    alert('Are you sure you want to delete ' + data.name);
    const id = data._id;
    this.service.deleteRawMaterial(id).subscribe((res: any) => {
      this.toast.success(data.name + ' deleted successfully');
      this.service.getRawMaterial().subscribe((res: any) => {
        this.get_row_material = res.materials;
        this.getRawMateriallist();
      });
      this.loader.hide();
    });
  }
  Editdetail(data: any) {}
  rowmaterialtype() {}
  saveRawMaterial(form: any) {
    if (form.invalid) return;
    this.loader.show();

    const obj: any = {
      name: form.value.name,
      unit: form.value.unit,
      quantity: form.value.quantity || 0,
      alertAt: form.value.alertAt,
      type: this.rawMaterial.type,
    };

    // If composite → attach recipe
    if (this.rawMaterial.type === 'COMPOSITE') {
      console.log('this.rawMaterial.type =====', this.rawMaterial.type);
      obj.outputQuantity = this.recipeOutputQuantity;
      obj.outputUnit = form.value.unit; // Pass the main unit (e.g., kg) for the premix itself

      // 🔥 Change "ingredients" to "materials" to match your backend route
      // The 'item' already contains rawMaterialId, quantityRequired, and unit.
      obj.ingredients = this.ingredients;
    }
    console.log('object ====', obj);
    const request = this.raw_material_isEdit
      ? this.service.editRowMaterial(obj, this.rowmaterial_id)
      : this.service.AddRowMaterial(obj);

    request.subscribe({
      next: (res: any) => {
        if (res.status == 'success') {
          console.log('response ====', res);
          this.loader.hide();
          this.closeModal();
          this.service.getRawMaterial().subscribe((res: any) => {
            this.toast.success('Added Sucessfully');
            this.get_row_material = res.materials;
            this.getRawMateriallist();
          });
        }

        // ... rest of your code is perfect ...
      },
    });
  }
  // row-material.component.ts

  openModal() {
    // CRITICAL: Reset the edit flag to false for New entries
    this.raw_material_isEdit = false;

    // Clear any existing ID from previous edits
    this.rowmaterial_id = null;

    // Clear the form fields
    this.resetForm();

    // Finally, show the modal
    this.showModal = true;
  }

  // Ensure resetForm covers all fields
  resetForm() {
    this.rawMaterial = {
      name: '',
      unit: '',
      type: '',
      quantity: null,
      alertAt: null,
    };
  }
  closeModal() {
    this.showModal = false;
    this.resetForm();
  }
  addIngredient() {
    this.ingredients.push({
      rawMaterialId: '',
      quantityRequired: 0,
      unit: 'gm',
    });
  }
  onQuickFilterChanged(event: any) {
    this.gridApi.setQuickFilter(event.target.value);
  }
  removeIngredient(index: number) {
    this.ingredients.splice(index, 1);
  }
  openAddStockModal(data: any) {
    this.raw_material_isEdit = false;
    this.showAddStockModal = true;
    console.log(data);
    this.row_material_name = data.name;
    this.addstock_materialid = data._id;
  }
  closeAddStockModal() {
    this.showAddStockModal = false;
  }
  submitAddStock() {
    this.loader.show();
    var obj: any = {
      quantity: this.addStockQty,
      materialId: this.addstock_materialid,
    };
    this.service.AddStock(obj).subscribe((res: any) => {
      console.log('response ===', res);
      if (res.status == 'success') {
        this.toast.success(res.message);
        this.showAddStockModal = false;
        this.service.getRawMaterial().subscribe((res: any) => {
          this.get_row_material = res.materials;
          this.getRawMateriallist();
          this.loader.hide();
        });
        this.loader.hide();
      }
    });
  }

  openAdjustStockModal(data: any) {
    this.showAdjustModal = true;
    this.adjuststock_id = data._id;
  }
  EditRowMaterial(data: any) {
    this.showModal = true;
    this.rawMaterial.name = data.name;
    this.rawMaterial.unit = data.unit;
    this.rawMaterial.quantity = data.quantity;
    this.rawMaterial.alertAt = data.alertAt;
    this.raw_material_isEdit = true;
    this.rowmaterial_id = data._id;
    this.rawMaterial.type = data.type;
  }
  closeAdjustStockModal() {
    this.showAdjustModal = false;
  }
  submitAdjustStock() {
    const payload = {
      materialId: this.adjuststock_id,
      newQuantity: this.newQuantity,
      note: this.adjustNote,
    };

    this.service.adjustStock(payload).subscribe({
      next: () => {
        this.toast.success('Stock adjusted');
        this.closeAdjustStockModal();
        this.service.getRawMaterial().subscribe((res: any) => {
          this.get_row_material = res.materials;
          this.getRawMateriallist();
        });
        this.showAdjustModal = false;
      },
      error: () => {
        this.toast.error('Failed to adjust stock');
      },
    });
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();

    // Responsive fix: resize table when window changes
    window.addEventListener('resize', () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
  openProductionModal(material: any) {
    this.selectedPremix = material;
    this.showProductionModal = true;
  }
  openProduceModal(row: any) {
    this.compositedata = row;

    this.showProduceModal = true;
  }
  closeProduceModal() {
    this.showProduceModal = false;
  }
  producePremix() {
    this.loader.show();
    const payload = {
      premixId: this.compositedata._id,
      qty: this.produceQty,
    };

    this.service.Addpremix(payload).subscribe((res: any) => {
      alert('Premix produced successfully');

      this.showProduceModal = false;
      this.service.getRawMaterial().subscribe((res: any) => {
        this.get_row_material = res.materials;
        this.getRawMateriallist();
        this.loader.hide();
      });
      // this.getRawMaterialList(); // refresh table
    });
  }
}
