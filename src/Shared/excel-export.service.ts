import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  /**
   * Format a date into DD/MM/YYYY
   */
  private formatDate(dateVal: any): string {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Format a date into hh:mm A (12-hour format)
   */
  private formatTime(dateVal: any): string {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get the order amount from whichever field the backend is sending.
   * Some records may use `grandTotal`, others `amount` or `totalAmount`.
   */
  private getOrderAmount(order: any): number {
    const rawValue = Number(
      order?.grandTotal ?? order?.totalAmount ?? order?.amount ?? order?.netAmount ?? 0,
    );
    return Number.isFinite(rawValue) ? rawValue : 0;
  }

  /**
   * Auto-fit columns based on content
   */
  private autoFitColumns(
    worksheet: XLSX.WorkSheet,
    data: any[],
    minWidths: { [key: string]: number } = {},
    maxWidths: { [key: string]: number } = {},
  ): void {
    if (!data || !data.length) return;
    const colKeys = Object.keys(data[0] || {});
    const colWidths: { wch: number }[] = [];

    colKeys.forEach((key) => {
      let maxLen = key.length;
      data.forEach((row) => {
        const val = row[key];
        if (val !== undefined && val !== null) {
          const str = String(val);
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      });

      const minW = minWidths[key] || 10;
      const maxW = maxWidths[key] || 40;
      const finalWidth = Math.min(Math.max(maxLen + 3, minW), maxW);
      colWidths.push({ wch: finalWidth });
    });

    worksheet['!cols'] = colWidths;
  }

  /**
   * Export Detailed Sales Orders to Excel with multiple sheets
   */
  exportSalesOrders(orders: any[], title: string = 'Sales_Report'): void {
    if (!orders || orders.length === 0) {
      alert('No sales data available to export');
      return;
    }

    // 1. SHEET 1: INVOICES / SALES ORDERS
    let totalQtyAll = 0;
    let totalSubtotalAll = 0;
    let totalDiscountAll = 0;
    let totalGstAll = 0;
    let totalGrandTotalAll = 0;

    const invoiceRows = orders.map((order: any, idx: number) => {
      // Calculate item summary string and total item quantity
      let itemsSummary = '';
      let orderQty = 0;

      if (order.items && Array.isArray(order.items)) {
        itemsSummary = order.items
          .map((item: any) => {
            const name = item.name || item.itemName || 'Item';
            const qty = Number(item.qty || item.quantity || 1);
            const price = Number(item.price || item.rate || 0);
            orderQty += qty;
            return `${name} (x${qty}${price ? ' - ₹' + price : ''})`;
          })
          .join(', ');
      }

      const subTotal = Number(order.subTotal || 0);
      const discount = Number(order.discountAmount || 0);
      const gst = Number(order.gstAmount || 0);
      const grandTotal = this.getOrderAmount(order);

      totalQtyAll += orderQty;
      totalSubtotalAll += subTotal;
      totalDiscountAll += discount;
      totalGstAll += gst;
      totalGrandTotalAll += grandTotal;

      let discountInfo = '-';
      if (discount > 0) {
        if (order.discountReason) {
          discountInfo = order.discountReason;
        } else if (order.discountType === 'percentage') {
          discountInfo = `${order.discountValue}% Off`;
        } else if (order.discountType === 'fixed') {
          discountInfo = `Flat ₹${order.discountValue}`;
        } else {
          discountInfo = `₹${discount}`;
        }
      }

      return {
        'S.No': idx + 1,
        'Order Number': order.orderNumber || '-',
        'Token No': order.tokenNumber !== undefined ? String(order.tokenNumber) : '-',
        'Date': this.formatDate(order.date || order.createdAt),
        'Time': this.formatTime(order.date || order.createdAt),
        'Customer Name': order.customerName || 'Walk-in Customer',
        'Customer Phone': order.phone || '-',
        'Order Type': order.ordertype ? (order.ordertype.toLowerCase() === 'dine' ? 'Dine-In' : 'Take Away') : 'Take Away',
        'Payment Mode': order.paymentMode || 'Cash',
        'Items Summary': itemsSummary || '-',
        'Total Items Qty': orderQty,
        'Subtotal (₹)': Number(subTotal.toFixed(2)),
        'Discount (₹)': Number(discount.toFixed(2)),
        'Discount Details': discountInfo,
        'GST Rate (%)': order.gstRate !== undefined ? `${order.gstRate}%` : '5%',
        'GST Amount (₹)': Number(gst.toFixed(2)),
        'Amount (₹)': Number(grandTotal.toFixed(2)),
        'Grand Total (₹)': Number(grandTotal.toFixed(2)),
      };
    });

    // Add Summary Row to Invoices Sheet
    invoiceRows.push({
      'S.No': 'TOTAL' as any,
      'Order Number': `Total Orders: ${orders.length}`,
      'Token No': '',
      'Date': '',
      'Time': '',
      'Customer Name': '',
      'Customer Phone': '',
      'Order Type': '',
      'Payment Mode': '',
      'Items Summary': '',
      'Total Items Qty': totalQtyAll,
      'Subtotal (₹)': Number(totalSubtotalAll.toFixed(2)),
      'Discount (₹)': Number(totalDiscountAll.toFixed(2)),
      'Discount Details': '',
      'GST Rate (%)': '',
      'GST Amount (₹)': Number(totalGstAll.toFixed(2)),
      'Amount (₹)': Number(totalGrandTotalAll.toFixed(2)),
      'Grand Total (₹)': Number(totalGrandTotalAll.toFixed(2)),
    });

    const invoicesWorksheet = XLSX.utils.json_to_sheet(invoiceRows);
    this.autoFitColumns(
      invoicesWorksheet,
      invoiceRows,
      {
        'S.No': 8,
        'Order Number': 22,
        'Token No': 10,
        'Date': 14,
        'Time': 12,
        'Customer Name': 20,
        'Customer Phone': 16,
        'Order Type': 12,
        'Payment Mode': 14,
        'Items Summary': 35,
        'Total Items Qty': 14,
        'Subtotal (₹)': 14,
        'Discount (₹)': 14,
        'Discount Details': 18,
        'GST Rate (%)': 12,
        'GST Amount (₹)': 14,
        'Amount (₹)': 16,
        'Grand Total (₹)': 16,
      },
      {
        'Items Summary': 45,
      },
    );

    // 2. SHEET 2: ITEM-WISE SALES BREAKDOWN
    const itemMap = new Map<string, { name: string; qty: number; unitPrice: number; revenue: number }>();

    orders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = (item.name || item.itemName || 'Item').trim();
          const qty = Number(item.qty || item.quantity || 1);
          const price = Number(item.price || item.rate || 0);
          const totalRev = price * qty;

          if (itemMap.has(name)) {
            const existing = itemMap.get(name)!;
            existing.qty += qty;
            existing.revenue += totalRev;
            if (!existing.unitPrice && price) existing.unitPrice = price;
          } else {
            itemMap.set(name, {
              name,
              qty,
              unitPrice: price,
              revenue: totalRev,
            });
          }
        });
      }
    });

    const itemRows = Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((item, idx) => {
        const share = totalGrandTotalAll > 0 ? ((item.revenue / totalGrandTotalAll) * 100).toFixed(1) + '%' : '0%';
        return {
          'S.No': idx + 1,
          'Item Name': item.name,
          'Quantity Sold': item.qty,
          'Unit Price (₹)': Number(item.unitPrice.toFixed(2)),
          'Total Revenue (₹)': Number(item.revenue.toFixed(2)),
          'Sales Share (%)': share,
        };
      });

    // Item breakdown summary row
    itemRows.push({
      'S.No': 'TOTAL' as any,
      'Item Name': `Distinct Items: ${itemMap.size}`,
      'Quantity Sold': totalQtyAll,
      'Unit Price (₹)': '' as any,
      'Total Revenue (₹)': Number(totalGrandTotalAll.toFixed(2)),
      'Sales Share (%)': '100%',
    });

    const itemsWorksheet = XLSX.utils.json_to_sheet(itemRows);
    this.autoFitColumns(
      itemsWorksheet,
      itemRows,
      {
        'S.No': 8,
        'Item Name': 28,
        'Quantity Sold': 14,
        'Unit Price (₹)': 14,
        'Total Revenue (₹)': 16,
        'Sales Share (%)': 14,
      },
      {
        'Item Name': 35,
      },
    );

    // 3. SHEET 3: PAYMENT METHOD SUMMARY
    const paymentMap = new Map<string, { count: number; total: number }>();
    orders.forEach((order: any) => {
      const mode = (order.paymentMode || 'Other').trim();
      const amount = Number(order.grandTotal || 0);
      if (paymentMap.has(mode)) {
        const curr = paymentMap.get(mode)!;
        curr.count += 1;
        curr.total += amount;
      } else {
        paymentMap.set(mode, { count: 1, total: amount });
      }
    });

    const paymentRows = Array.from(paymentMap.entries()).map(([mode, data]) => {
      const pct = totalGrandTotalAll > 0 ? ((data.total / totalGrandTotalAll) * 100).toFixed(1) + '%' : '0%';
      return {
        'Payment Mode': mode,
        'Number of Orders': data.count,
        'Total Collected (₹)': Number(data.total.toFixed(2)),
        'Percentage (%)': pct,
      };
    });

    paymentRows.push({
      'Payment Mode': 'TOTAL',
      'Number of Orders': orders.length,
      'Total Collected (₹)': Number(totalGrandTotalAll.toFixed(2)),
      'Percentage (%)': '100%',
    });

    const paymentWorksheet = XLSX.utils.json_to_sheet(paymentRows);
    this.autoFitColumns(
      paymentWorksheet,
      paymentRows,
      {
        'Payment Mode': 18,
        'Number of Orders': 16,
        'Total Collected (₹)': 20,
        'Percentage (%)': 15,
      },
      {
        'Payment Mode': 20,
      },
    );

    // CREATE WORKBOOK & EXPORT
    const workbook: XLSX.WorkBook = {
      Sheets: {
        'Sales Orders': invoicesWorksheet,
        'Item Breakdown': itemsWorksheet,
        'Payment Summary': paymentWorksheet,
      },
      SheetNames: ['Sales Orders', 'Item Breakdown', 'Payment Summary'],
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanTitle}_${todayStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export aggregated Daily Sales Summary and Payment breakdown
   */
  private buildSalesSummaryFileName(filterLabel: string = 'All', from?: string, to?: string): string {
    const cleanDate = (date?: string) => {
      if (!date) return '';
      return String(date).trim().replace(/[^0-9-]/g, '');
    };

    const fromDate = cleanDate(from);
    const toDate = cleanDate(to);

    if (fromDate && toDate && fromDate !== toDate) {
      return `sales_summery_of_${fromDate}_to_${toDate}.xlsx`;
    }

    if (fromDate || toDate) {
      return `sales_summery_of_${fromDate || toDate}.xlsx`;
    }

    const safeLabel = String(filterLabel || 'all').toLowerCase().replace(/[^a-z0-9_\-]/g, '_');
    return `sales_summery_${safeLabel || 'all'}.xlsx`;
  }

  exportSalesSummary(
    sales: any[],
    paymentBreakdown: any[],
    filterLabel: string = 'All',
    from?: string,
    to?: string,
  ): void {
    if (!sales || sales.length === 0) {
      alert('No sales summary data available to export');
      return;
    }

    let grandTotalSales = 0;
    let grandTotalOrders = 0;

    const dailyRows = sales.map((row: any, idx: number) => {
      const total = Number(row.totalSales || 0);
      const orders = Number(row.orderCount || 0);
      const aov = orders > 0 ? total / orders : 0;
      grandTotalSales += total;
      grandTotalOrders += orders;

      return {
        'S.No': idx + 1,
        'Date': row._id || '-',
        'Orders Count': orders,
        'Total Sales (₹)': Number(total.toFixed(2)),
        'Avg Order Value (₹)': Number(aov.toFixed(2)),
      };
    });

    const overallAov = grandTotalOrders > 0 ? grandTotalSales / grandTotalOrders : 0;
    dailyRows.push({
      'S.No': 'TOTAL' as any,
      'Date': `Days: ${sales.length}`,
      'Orders Count': grandTotalOrders,
      'Total Sales (₹)': Number(grandTotalSales.toFixed(2)),
      'Avg Order Value (₹)': Number(overallAov.toFixed(2)),
    });

    const dailyWorksheet = XLSX.utils.json_to_sheet(dailyRows);
    this.autoFitColumns(
      dailyWorksheet,
      dailyRows,
      {
        'S.No': 8,
        'Date': 16,
        'Orders Count': 14,
        'Total Sales (₹)': 16,
        'Avg Order Value (₹)': 20,
      },
      {
        'Date': 20,
      },
    );

    // Payment Sheet
    const payRows = (paymentBreakdown || []).map((p: any) => {
      const amt = Number(p.totalAmount || 0);
      const cnt = Number(p.orderCount || 0);
      const pct = grandTotalSales > 0 ? ((amt / grandTotalSales) * 100).toFixed(1) + '%' : '0%';
      return {
        'Payment Mode': p._id || 'Other',
        'Orders Count': cnt,
        'Total Amount (₹)': Number(amt.toFixed(2)),
        'Percentage (%)': pct,
      };
    });

    payRows.push({
      'Payment Mode': 'TOTAL',
      'Orders Count': grandTotalOrders,
      'Total Amount (₹)': Number(grandTotalSales.toFixed(2)),
      'Percentage (%)': '100%',
    });

    const payWorksheet = XLSX.utils.json_to_sheet(payRows);
    this.autoFitColumns(
      payWorksheet,
      payRows,
      {
        'Payment Mode': 18,
        'Orders Count': 14,
        'Total Amount (₹)': 18,
        'Percentage (%)': 15,
      },
      {
        'Payment Mode': 20,
      },
    );

    const workbook: XLSX.WorkBook = {
      Sheets: {
        'Daily Sales': dailyWorksheet,
        'Payment Breakdown': payWorksheet,
      },
      SheetNames: ['Daily Sales', 'Payment Breakdown'],
    };

    const fileName = this.buildSalesSummaryFileName(filterLabel, from, to);

    XLSX.writeFile(workbook, fileName);
  }
}
