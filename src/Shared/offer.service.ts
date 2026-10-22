import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  _id: string;
  name: string;
  description?: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  isActive: boolean;
  branchId: string;
  createdAt: string;
}

export interface CreateOfferPayload {
  name: string;
  description?: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
}

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  // private apiUrl: any = 'http://localhost:3000/api';
    private apiUrl: any = '/api';
  constructor(private http: HttpClient) {}

  getAllOffers(): Observable<{ status: string; offers: Offer[] }> {
    return this.http.get<{ status: string; offers: Offer[] }>(
      `${this.apiUrl}/offer/offerlist`,
      { withCredentials: true },
    );
  }

  getActiveOffers(): Observable<{ status: string; offers: Offer[] }> {
    return this.http.get<{ status: string; offers: Offer[] }>(
      `${this.apiUrl}/offer/activeoffer`,
      { withCredentials: true },
    );
  }

  createOffer(
    payload: CreateOfferPayload,
  ): Observable<{ status: string; offer: Offer }> {
    return this.http.post<{ status: string; offer: Offer }>(
      `${this.apiUrl}/offer/createOffer`,
      payload,
      { withCredentials: true },
    );
  }

  toggleOffer(id: string): Observable<{ status: string; offer: Offer }> {
    return this.http.patch<{ status: string; offer: Offer }>(
      `${this.apiUrl}/offer/${id}/toggle`,
      {},
      { withCredentials: true },
    );
  }

  deleteOffer(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/offer/${id}`,
      { withCredentials: true },
    );
  }
}
