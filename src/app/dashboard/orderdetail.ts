export type CartItem = {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
  total: number;

};

export type Order = {
  orderNumber: string;
  date: Date;
  customerName?: string;
  phone?: string;
  paymentMode?: 'Cash' | 'UPI' | 'Card';
  items: OrderItem[];
  subTotal: number;
  handling: number;
  grandTotal: number;
  ordertype: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed' | null;
  discountValue?: number;
  discountReason?: string | null;
  gstIncluded?: boolean;
  gstRate?: number;
  gstAmount?: number;
};
