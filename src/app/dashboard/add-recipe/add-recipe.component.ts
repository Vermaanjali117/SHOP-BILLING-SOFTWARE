import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../Shared/shared.service';
import { AgGridModule } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../Shared/loader.service';
import { NgSelectModule } from '@ng-select/ng-select';
declare var bootstrap: any;

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.css'],
  standalone: true,
  imports: [AgGridModule, FormsModule, CommonModule, NgSelectModule],
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
    });
  }

  removeMaterial(index: number) {
    this.materials.splice(index, 1);
  }

  saveRecipe() {
    this.loader.show();
    // Addsaverecipe
    var obj = {
      itemId: this.selectedItemId,
      materials: this.materials,
    };
    this.service.Addsaverecipe(obj).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toast.success(res.message);
        this.closeRecipeModal();
        this.materials = [];
        this.selectedItemId = '';
        this.service.getRawMaterial().subscribe((res: any) => {
          this.get_row_material = res.materials;
        });
        this.loader.hide();
      } else {
        this.toast.warning(res.message);
      }
    });
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
    this.isEdit = true; // 🔥 edit mode ON
    this.selectedRecipe = recipe;

    // ✅ set selected items
    this.selectedItemId = recipe.itemId?._id;

    // ✅ prefill materials
    this.materials = recipe.materials.map((mat: any) => ({
      rawMaterialId: mat.rawMaterialId?._id,
      quantityRequired: mat.quantityRequired,
    }));

    // ✅ open same modal
    this.showAdjustModal = true;
  }

  openAdjustStockModal() {
    this.showAdjustModal = true;
  }
  GetSavedRecipelist() {
    this.loader.show();
    this.service.getSavedRecipe().subscribe((res: any) => {
      this.get_saved_recipe = res.recipes;
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
        headerName: 'Item Name',
        valueGetter: (params: any) => params.data.itemId?.name,
        sortable: true,
        filter: true,
        flex: 1.5,
      },

      {
        headerName: 'Price',
        valueGetter: (params: any) =>
          params.data.itemId?.price ? `₹${params.data.itemId.price}` : '-',
        sortable: true,
        flex: 1,
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
    alert('Are you sure you want to delete' + data.itemId?.name);
    this.delete_id = data._id;
    this.service.DeleteRecipe(this.delete_id).subscribe((res: any) => {
      this.get_saved_recipe = res.recipes;
      this.service.getRawMaterial().subscribe((res: any) => {
        this.get_row_material = res.materials;
      });
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
      this.closeRecipeModal();
      this.loader.hide();
    });
  }
}
