import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  //  private apiUrl: any = 'http://localhost:3000/api';
   private apiUrl: any = '/api';
  constructor(private http: HttpClient) {}
  loginpost(sync: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, sync, {
      withCredentials: true,
    });
  }
  logout() {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }

  addpost(sync: any) {
    return this.http.post(`${this.apiUrl}/items/addnewitem`, sync, {
      withCredentials: true,
    });
  }
  edititem(sync: any) {
    return this.http.patch(`${this.apiUrl}/items/edititems`, sync, {
      withCredentials: true,
    });
  }
  getlistpost() {
    return this.http.get(`${this.apiUrl}/items/getlist`, {
      withCredentials: true,
    });
  }
  getinventoryhistory() {
    return this.http.get(`${this.apiUrl}/raw-materials/inventory`, {
      withCredentials: true,
    });
  }
  createorder(sync: any) {
    return this.http.post(`${this.apiUrl}/orders/createorder`, sync, {
      withCredentials: true,
    });
  }

  getOrderById(id: string) {
    return this.http.get(`${this.apiUrl}/orders/getorderdetail/${id}`, {
      withCredentials: true,
    });
  }
  getbilllist() {
    return this.http.get(`${this.apiUrl}/orders/getorderlist`, {
      withCredentials: true,
    });
  }
  getRawMaterial() {
    return this.http.get(`${this.apiUrl}/raw-materials/get-row-material-list`, {
      withCredentials: true,
    });
  }
  getSavedRecipe() {
    return this.http.get(`${this.apiUrl}/recipe/savedrecipelist`, {
      withCredentials: true,
    });
  }
  deleterecipe() {}
  getsalessummery(from?: string, to?: string) {
    let params: any = {};

    if (from && to) {
      params.from = from;
      params.to = to;
    }

    return this.http.get(`${this.apiUrl}/orders/salessummery`, {
      params,
      withCredentials: true,
    });
  }

  deletemenuitem(id: string) {
    return this.http.delete(`${this.apiUrl}/items/deleteitem`, {
      body: { _id: id },
      withCredentials: true,
    });
  }

  deleteorder(id: string) {
    return this.http.delete(`${this.apiUrl}/orders/deleteorder/${id}`, {
      withCredentials: true,
    });
  }
  deleteRawMaterial(id: string) {
    return this.http.delete(`${this.apiUrl}/raw-materials/delete/${id}`, {
      withCredentials: true,
    });
  }

  AddRowMaterial(sync: any) {
    return this.http.post(`${this.apiUrl}/raw-materials/add`, sync, {
      withCredentials: true,
    });
  }
  AddStock(sync: any) {
    return this.http.post(`${this.apiUrl}/raw-materials/add-stock`, sync, {
      withCredentials: true,
    });
  }
  editRowMaterial(sync: any, id: any) {
    return this.http.patch(`${this.apiUrl}/raw-materials/update/${id}`, sync, {
      withCredentials: true,
    });
  }
  adjustStock(sync: any) {
    return this.http.post(`${this.apiUrl}/raw-materials/adjust-stock`, sync, {
      withCredentials: true,
    });
  }
  Addsaverecipe(sync: any) {
    return this.http.post(`${this.apiUrl}/recipe/save`, sync, {
      withCredentials: true,
    });
  }
  getCustomerByPhone(id: string) {
    return this.http.get(`${this.apiUrl}/customer/savedrecipelist/${id}`, {
      withCredentials: true,
    });
  }
  searchCustomer(phone: string) {
    return this.http.get(`${this.apiUrl}/customer/search?q=${phone}`, {
      withCredentials: true,
    });
  }
  deletebyRange(sync: any) {
    return this.http.delete(
      `${this.apiUrl}/raw-materials/inventory/delete-range`,
      {
        body: sync, // Your data goes here
        withCredentials: true, // Your options stay here
      },
    );
  }
  deleteInBulk(sync: any) {
    return this.http.delete(
      `${this.apiUrl}/raw-materials/inventory/bulk-delete`,
      {
        body: sync, // Your data goes here
        withCredentials: true, // Your options stay here
      },
    );
  }
  EditRecipe(sync: any, id: any) {
    return this.http.put(`${this.apiUrl}/recipe/update_recipe/${id}`, sync, {
      withCredentials: true,
    });
  }
  Addpremix(sync: any) {
    return this.http.post(
      `${this.apiUrl}/raw-materials/produce-composite`,
      sync,
      {
        withCredentials: true,
      },
    );
  }
  DeleteRecipe(id: any) {
    return this.http.delete(`${this.apiUrl}/recipe/delete/${id}`, {
      withCredentials: true,
    });
  }
  getConsumptionSummary(fromDate?: string, toDate?: string) {
    let params: any = {};

    if (fromDate && toDate) {
      params.from = fromDate;
      params.to = toDate;
    }

    return this.http.get(
      `${this.apiUrl}/raw-materials/inventory/consumption-summary`,
      {
        params, // ✅ THIS WAS MISSING
        withCredentials: true,
      },
    );
  }
}
