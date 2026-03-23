const { Parser } = require('json2csv');

const exportInvoicesCSV = (invoices) => {
  const fields = [
    { label: 'Invoice No',      value: 'invoiceNo' },
    { label: 'Status',          value: 'status' },
    { label: 'Client Name',     value: 'clientName' },
    { label: 'Client Email',    value: 'clientEmail' },
    { label: 'Client State',    value: 'clientState' },
    { label: 'Seller State',    value: 'sellerState' },
    { label: 'Currency',        value: 'currency' },
    { label: 'Subtotal',        value: 'subtotal' },
    { label: 'CGST',            value: 'gstBreakdown.totalCGST' },
    { label: 'SGST',            value: 'gstBreakdown.totalSGST' },
    { label: 'IGST',            value: 'gstBreakdown.totalIGST' },
    { label: 'Total GST',       value: 'gstBreakdown.totalGST' },
    { label: 'Discount',        value: 'discount' },
    { label: 'Total',           value: 'total' },
    { label: 'Due Date',        value: 'dueDate' },
    { label: 'Paid At',         value: 'paidAt' },
    { label: 'Created At',      value: 'createdAt' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(invoices);
};

const exportGSTCSV = (invoices) => {
  const fields = [
    { label: 'Invoice No',   value: 'invoiceNo' },
    { label: 'Client Name',  value: 'clientName' },
    { label: 'Client State', value: 'clientState' },
    { label: 'Seller State', value: 'sellerState' },
    { label: 'Inter State',  value: 'gstBreakdown.interState' },
    { label: 'Subtotal',     value: 'subtotal' },
    { label: 'CGST',         value: 'gstBreakdown.totalCGST' },
    { label: 'SGST',         value: 'gstBreakdown.totalSGST' },
    { label: 'IGST',         value: 'gstBreakdown.totalIGST' },
    { label: 'Total GST',    value: 'gstBreakdown.totalGST' },
    { label: 'Total',        value: 'total' },
    { label: 'Status',       value: 'status' },
    { label: 'Date',         value: 'createdAt' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(invoices);
};

module.exports = { exportInvoicesCSV, exportGSTCSV };