import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}
  loginpost(sync: any) {
    return this.http.post(`${environment.apiUrl}/auth/login`, sync, {
      withCredentials: true,
    });
  }
  addpost(sync: any) {
    return this.http.post(`${environment.apiUrl}/items/addnewitem`, sync, {
      withCredentials: true,
    });
  }
  edititem(sync: any) {
    return this.http.patch(`${environment.apiUrl}/items/edititems`, sync, {
      withCredentials: true,
    });
  }
  getlistpost() {
    return this.http.get(`${environment.apiUrl}/items/getlist`, { withCredentials: true });
  }

  createorder(sync: any) {
    return this.http.post(`${environment.apiUrl}/orders/createorder`, sync, {
      withCredentials: true,
    });
  }

  getOrderById(id: string) {
    return this.http.get(`${environment.apiUrl}/orders/getorderdetail/${id}`, {
      withCredentials: true,
    });
  }
  getbilllist() {
    return this.http.get(`${environment.apiUrl}/orders/getorderlist`, {
      withCredentials: true,
    });
  }

  getsalessummery() {
    return this.http.get(`${environment.apiUrl}/orders/salessummery`, {
      withCredentials: true,
    });
  }
deletemenuitem(id: string) {
  return this.http.delete(`${environment.apiUrl}/items/deleteitem`, {
    body: { _id: id },
    withCredentials: true,
  });
}


deleteorder(id: string) {
  return this.http.delete(`${environment.apiUrl}/orders/deleteorder/${id}`, {
    withCredentials: true,
  });
}

  }

