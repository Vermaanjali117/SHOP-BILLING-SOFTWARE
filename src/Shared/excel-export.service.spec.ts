import { ExcelExportService } from './excel-export.service';
import * as XLSX from 'xlsx';

describe('ExcelExportService', () => {
  let service: ExcelExportService;

  beforeEach(() => {
    service = new ExcelExportService();
  });

  it('should include amount in Excel rows when the order uses amount instead of grandTotal', () => {
    spyOn(XLSX, 'writeFile').and.stub();

    const orders = [
      {
        orderNumber: 'ORD-1',
        tokenNumber: 12,
        date: '2026-11-03T12:30:00Z',
        customerName: 'Anjali',
        phone: '9988776655',
        paymentMode: 'Cash',
        ordertype: 'Dine',
        items: [{ name: 'Tea', qty: 2, price: 40 }],
        amount: 80,
      },
    ];

    service.exportSalesOrders(orders, 'Test_Export');

    const workbook = (XLSX.writeFile as jasmine.Spy).calls.mostRecent().args[0] as XLSX.WorkBook;
    const sheet = workbook.Sheets['Sales Orders'] as XLSX.WorkSheet;
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Array<{ [key: string]: any }>;
    const firstRow = rows[0];

    expect(firstRow['Amount (₹)']).toBe(80);
    expect(firstRow['Grand Total (₹)']).toBe(80);
  });
});
