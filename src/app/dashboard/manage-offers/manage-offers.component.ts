import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OfferService,
  Offer,
  CreateOfferPayload,
} from '../../../Shared/offer.service';

@Component({
  selector: 'app-manage-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-offers.component.html',
  styleUrls: ['./manage-offers.component.css'],
})
export class ManageOffersComponent implements OnInit {
  offers: Offer[] = [];
  isLoading = false;
  isSubmitting = false;
  showForm = false;
  deleteConfirmId: string | null = null;

  form: CreateOfferPayload = {
    name: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: 0,
  };

  successMessage = '';
  errorMessage = '';

  constructor(private offerService: OfferService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.offerService.getAllOffers().subscribe({
      next: (res) => {
        this.offers = res.offers;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load offers';
        this.isLoading = false;
      },
    });
  }

  openForm(): void {
    this.showForm = true;
    this.resetForm();
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 0,
    };
  }

  submitOffer(): void {
    if (!this.form.name || !this.form.discountValue) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }
    if (
      this.form.discountType === 'PERCENT' &&
      (this.form.discountValue <= 0 || this.form.discountValue > 100)
    ) {
      this.errorMessage = 'Percentage must be between 1 and 100';
      return;
    }
    if (this.form.discountType === 'FLAT' && this.form.discountValue <= 0) {
      this.errorMessage = 'Flat discount must be greater than 0';
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    this.offerService.createOffer(this.form).subscribe({
      next: (res) => {
        this.offers.unshift(res.offer);
        this.successMessage = `"${res.offer.name}" created successfully!`;
        this.isSubmitting = false;
        this.closeForm();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to create offer';
        this.isSubmitting = false;
      },
    });
  }

  toggleOffer(offer: Offer): void {
    this.offerService.toggleOffer(offer._id).subscribe({
      next: (res) => {
        const index = this.offers.findIndex((o) => o._id === offer._id);
        if (index !== -1) this.offers[index] = res.offer;
        this.successMessage = `"${res.offer.name}" ${res.offer.isActive ? 'enabled' : 'disabled'}`;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to toggle offer';
      },
    });
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteOffer(id: string): void {
    this.offerService.deleteOffer(id).subscribe({
      next: () => {
        this.offers = this.offers.filter((o) => o._id !== id);
        this.deleteConfirmId = null;
        this.successMessage = 'Offer deleted successfully';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete offer';
        this.deleteConfirmId = null;
      },
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getDiscountLabel(offer: Offer): string {
    return offer.discountType === 'PERCENT'
      ? `${offer.discountValue}% off`
      : `₹${offer.discountValue} off`;
  }
}
