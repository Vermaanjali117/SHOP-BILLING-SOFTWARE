import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-public-bill',
  templateUrl: './public-bill.component.html',
  styleUrls: ['./public-bill.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PublicBillComponent implements OnInit {
  order: any = null;
  items: any[] = [];
  loading = true;
  error = false;

  // Branch info map — same as bill.component
  branches: any = {
    '695755832c76b65a570b1abb': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Annpurna Enterprise',
      address: '51-A Chandranagar Charari Lal Banglow, Kanpur - 208007',
    },
    '695755902c76b65a570b1abd': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Riddhi Enterprises',
      address: 'Gooba Garden Crossing, Metro pillar no -16 IIT Kanpur',
    },
    '6ada3835c258ef239e98357e': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'Simran Enterprises',
      address: 'Benajhabar Rd, Motilal Swaroop Nagar, Harsh Nagar Kanpur',
    },
    '6ada3997ac5a9079479c08f8': {
      name: 'THE BELGIQUE BITES CO',
      subtitle: 'test Enterprises',
      address: 'test branch IIT Kanpur',
    },
  };

  currentBranch: any = {
    name: 'THE BELGIQUE BITES CO',
    subtitle: '',
    address: '',
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }
    const apiUrl = environment.apiUrl || '/api';
    this.http.get<any>(`${apiUrl}/orders/getorderdetail/${id}`).subscribe({
      next: (res) => {
        const orderData = res?.data || res?.order || res;
        this.order = orderData;
        this.items = Array.isArray(orderData?.items) ? orderData.items : [];
        this.currentBranch =
          this.branches[orderData?.branchId] || this.currentBranch;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get grandTotal(): number {
    const sub = this.items.reduce(
      (acc, i) => acc + Number(i.price || 0) * Number(i.qty || 0),
      0
    );
    const disc = Number(this.order?.discountAmount || 0);
    return +Math.max(0, sub - disc).toFixed(2);
  }

  get gstAmount(): number {
    const sub = this.items.reduce(
      (acc, i) => acc + Number(i.price || 0) * Number(i.qty || 0),
      0
    );
    const disc = Number(this.order?.discountAmount || 0);
    const discounted = Math.max(0, sub - disc);
    const gstRate = Number(this.order?.gstRate || 5);
    const taxable = discounted / (1 + gstRate / 100);
    return +(discounted - taxable).toFixed(2);
  }
}
