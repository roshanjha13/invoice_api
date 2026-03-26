const { 
  calculateInvoiceGST, 
  isInterState 
} = require('../src/utils/gstCalculator');

const { 
  getGSTRate, 
  isValidHSN 
} = require('../src/utils/hsnCodes');

describe('GST Calculator Tests', () => {

  // Inter State Detection
  describe('isInterState()', () => {
    it('should detect inter state correctly', () => {
      expect(isInterState('Maharashtra', 'Delhi')).toBe(true);
    });

    it('should detect intra state correctly', () => {
      expect(isInterState('Maharashtra', 'Maharashtra')).toBe(false);
    });
  });

  // HSN Code
  describe('HSN Codes', () => {
    it('should return correct GST rate for IT services', () => {
      expect(getGSTRate('9983')).toBe(18);
    });

    it('should return 0 for education services', () => {
      expect(getGSTRate('9992')).toBe(0);
    });

    it('should validate HSN code', () => {
      expect(isValidHSN('9983')).toBe(true);
      expect(isValidHSN('0000')).toBe(false);
    });
  });

  // GST Calculation — Intra State
  describe('calculateInvoiceGST() — Intra State', () => {
    const items = [{
      description: 'Web Dev',
      hsnCode:     '9983',
      quantity:    10,
      rate:        2000,
      amount:      20000
    }];

    it('should calculate CGST + SGST for intra state', () => {
      const result = calculateInvoiceGST(items, 'Maharashtra', 'Maharashtra');
      expect(result.interState).toBe(false);
      expect(result.totalCGST).toBeGreaterThan(0);
      expect(result.totalSGST).toBeGreaterThan(0);
      expect(result.totalIGST).toBe(0);
      expect(result.totalCGST).toBe(result.totalSGST);
    });

    it('should calculate correct subtotal', () => {
      const result = calculateInvoiceGST(items, 'Maharashtra', 'Maharashtra');
      expect(result.subtotal).toBe(20000);
    });

    it('should calculate correct total with GST', () => {
      const result = calculateInvoiceGST(items, 'Maharashtra', 'Maharashtra');
      expect(result.total).toBe(result.subtotal + result.totalGST);
    });
  });

  // GST Calculation — Inter State
  describe('calculateInvoiceGST() — Inter State', () => {
    const items = [{
      description: 'Web Dev',
      hsnCode:     '9983',
      quantity:    5,
      rate:        1000,
      amount:      5000
    }];

    it('should calculate IGST for inter state', () => {
      const result = calculateInvoiceGST(items, 'Maharashtra', 'Delhi');
      expect(result.interState).toBe(true);
      expect(result.totalIGST).toBeGreaterThan(0);
      expect(result.totalCGST).toBe(0);
      expect(result.totalSGST).toBe(0);
    });
  });

  // Multiple Items
  describe('calculateInvoiceGST() — Multiple Items', () => {
    const items = [
      { description: 'Web Dev',    hsnCode: '9983', quantity: 10, rate: 2000, amount: 20000 },
      { description: 'Logo Design', hsnCode: '9983', quantity: 1,  rate: 5000, amount: 5000  },
    ];

    it('should calculate GST for multiple items', () => {
      const result = calculateInvoiceGST(items, 'Maharashtra', 'Maharashtra');
      expect(result.subtotal).toBe(25000);
      expect(result.items.length).toBe(2);
    });
  });

});