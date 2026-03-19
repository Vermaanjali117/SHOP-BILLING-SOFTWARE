import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../Shared/loader.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
declare var bootstrap: any;

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css'],
  standalone: true,
  imports: [
    AgGridModule,
    FormsModule,
    CommonModule,
    NgSelectModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
  ],
})
export class AddRecipeComponent implements OnInit {
  isEdit = false;
  selectedRecipe: any = null;
  showRecipeModal = false;
  rowData: any = [];
  showAddStockModal: boolean = false;
  columnDefs: any = [];
  selectedItemId: any;
  delete_id: any;
  gridApi: any;
  itemsList: any = [];
  get_item_list: any = [];
  rawMaterialsList: any = [];
  getedit_id: any;
  materials: any = [];
  get_saved_recipe: any = [];
  get_row_material: any = [];
  showAdjustModal: boolean = false;
  constructor(
    public service: SharedService,
    public loader: LoaderService,
    public toast: ToastrService,
  ) {}
  ngOnInit(): void {
    this.getRawMateriallist();
    this.GetSavedRecipelist();
    this.getlist();
    this.loader.show();
    this.service.getRawMaterial().subscribe((res: any) => {
      this.get_row_material = res.materials;
    });
    this.loader.hide();
  }
  getrecipelist() {}
  addMaterial() {
    this.materials.push({
      rawMaterialId: null,
      quantityRequired: 0,
      unit: 'gm',
    });
  }
  removeMaterial(index: number) {
    this.materials.splice(index, 1);
  }
  // New logic for the '-' button
  removeLastMaterial() {
    if (this.materials.length > 0) {
      this.materials.pop();
    }
  }
  saveRecipe() {
    // 1. Basic Validation to prevent empty saves
    if (!this.selectedItemId || this.materials.length === 0) {
      this.toast.warning(
        'Please select an item and add at least one material.',
      );
      return;
    }

    this.loader.show();

    const obj = {
      itemId: this.selectedItemId,
      materials: this.materials, // Materials now contain {rawMaterialId, quantityRequired, unit}
    };

    this.service.Addsaverecipe(obj).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toast.success(res.message);

          // 2. Clear data and close UI
          this.resetRecipeForm(); // Using a helper to keep it clean
          this.closeRecipeModal();

          // 3. Refresh the Recipe list instead of just raw materials
          // This ensures the main Ag-Grid updates with the new recipe
          this.GetSavedRecipelist_detail();
          this.GetSavedRecipelist();
        } else {
          this.toast.warning(res.message);
        }
        this.loader.hide();
      },
      error: (err) => {
        console.error('Recipe Save Error:', err);
        this.toast.error('Something went wrong while saving the recipe.');
        this.loader.hide();
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
  // Helper to reset form state
  resetRecipeForm() {
    this.materials = [];
    this.selectedItemId = '';
  }
  getRawMateriallist() {
    this.loader.show();
    this.service.getRawMaterial().subscribe((res: any) => {
      this.get_row_material = res.materials;
      this.loader.hide();
    });
  }
  getlist() {
    this.service.getlistpost().subscribe((res: any) => {
      if (res.status == 'success') {
        this.get_item_list = res.data;

        // Extract unique categories
      }
    });
    this.loader.hide();
  }
  showmodel() {
    this.isEdit = false;
    this.selectedRecipe = null;
    this.materials = [];
    this.selectedItemId = '';
  }
  closeRecipeModal() {
    this.showAdjustModal = false;
  }
  openEditRecipe(recipe: any) {
    this.getedit_id = recipe._id;
    this.isEdit = true;
    this.selectedRecipe = recipe;
    this.selectedItemId = recipe.productId?._id || recipe.productId;
    this.materials = recipe.materials.map((mat: any) => ({
      rawMaterialId: mat.rawMaterialId?._id || mat.rawMaterialId,
      quantityRequired: mat.quantityRequired,
      unit: mat.unit || 'gm',
    }));

    this.showAdjustModal = true;
  }
  onQuickFilterChanged(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.gridApi) {
      this.gridApi.setQuickFilter(filterValue);
    }
  }
  openAdjustStockModal() {
    this.isEdit = false;
    this.selectedItemId = null;
    this.materials = [];
    this.selectedRecipe = null;
    this.addMaterial();
    this.showAdjustModal = true;
  }
  GetSavedRecipelist() {
    this.loader.show();
    this.service.getSavedRecipe().subscribe((res: any) => {
      this.get_saved_recipe = res.recipes;
      console.log('this.get_saved_recipe ====', this.get_saved_recipe);
      this.GetSavedRecipelist_detail();
      this.loader.hide();
    });
  }
  GetSavedRecipelist_detail() {
    this.columnDefs = [
      {
        headerName: 'S.No',
        valueGetter: 'node.rowIndex + 1',
        width: 80,
      },

      {
        headerName: 'Material/Item Name',
        // Use dot notation to reach the nested name
        field: 'productId.name',
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 150,
      },
      {
        headerName: 'Price',
        // Access the price inside the productId object
        valueGetter: (p: any) =>
          p.data.productId?.price ? `₹${p.data.productId.price}` : '-',
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: 'Materials',
        cellRenderer: (params: any) => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-sm btn-outline-primary';
          btn.innerText = `View (${params.data.materials.length})`;

          btn.onclick = () => {
            this.openRecipeModal(params.data);
          };

          return btn;
        },
        width: 140,
      },

      {
        headerName: 'Last Updated',
        valueGetter: (params: any) =>
          new Date(params.data.updatedAt).toLocaleString(),
        sortable: true,
        flex: 1.5,
      },

      {
        headerName: 'Edit',
        cellRenderer: (params: any) => {
          const button = document.createElement('button');
          button.className =
            'flex items-center justify-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full w-8 h-8 transition';

          button.innerHTML = '✏️';

          button.addEventListener('click', () => {
            this.openEditRecipe(params.data);
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
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;

          button.addEventListener('click', () => {
            this.deleteRecipe(params.data);
          });

          return button;
        },
        width: 100,
        sortable: false,
        filter: false,
      },
    ];
    this.rowData = this.get_saved_recipe;
  }
  deleteRecipe(data: any) {
    alert('Are you sure you want to delete ' + data.productId?.name);
    this.delete_id = data._id;
    this.service.DeleteRecipe(this.delete_id).subscribe((res: any) => {
      this.get_saved_recipe = res.recipes;
      this.service.getRawMaterial().subscribe((res: any) => {
        this.get_row_material = res.materials;
      });
      this.GetSavedRecipelist();
      this.loader.hide();
    });
  }
  openRecipeModal(recipe: any) {
    this.selectedRecipe = recipe;
    this.showRecipeModal = true;
  }

  closeRecipeModalRowMaterial() {
    this.showRecipeModal = false;
    this.selectedRecipe = null;
  }
  editRecipe() {
    var obj = {
      itemId: this.selectedItemId,
      materials: this.materials,
    };
    this.loader.show();
    this.service.EditRecipe(obj, this.getedit_id).subscribe((res: any) => {
      this.get_saved_recipe = res.recipes;
      this.service.getRawMaterial().subscribe((res: any) => {
        this.get_row_material = res.materials;
      });
      this.GetSavedRecipelist_detail();
      this.GetSavedRecipelist();
      this.closeRecipeModal();
      this.loader.hide();
    });
  }
}
