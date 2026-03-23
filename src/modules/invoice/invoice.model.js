const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const itemSchema = new mongoose.Schema({
  _id:         { type: String, default: () => `item_${uuidv4().replace(/-/g, '')}` },
  description: { type: String, required: true },
  hsnCode:     { type: String },
  quantity:    { type: Number, required: true },
  rate:        { type: Number, required: true },
  amount:      { type: Number, required: true },
  gstRate:     { type: Number, default: 18 },
  gstAmount:   { type: Number, default: 0 },
  cgst:        { type: Number, default: 0 },
  sgst:        { type: Number, default: 0 },
  igst:        { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
});

const invoiceSchema = new mongoose.Schema({
  _id:           { type: String, default: () => `inv_${uuidv4().replace(/-/g, '')}` },
  userId:        { type: String, required: true, ref: 'User' },
  invoiceNo:     { type: String, unique: true },
  status:        { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  currency:      { type: String, default: 'INR' },

  // Client Info
  clientName:    { type: String, required: true },
  clientEmail:   { type: String, required: true },
  clientAddress: { type: String },
  clientState:   { type: String },

  // Business Info
  businessName:  { type: String },
  businessEmail: { type: String },
  sellerState:   { type: String },

  items:         [itemSchema],
  subtotal:      { type: Number },
  discount:      { type: Number, default: 0 },

  // GST Breakdown
  gstBreakdown: {
    totalCGST:  { type: Number, default: 0 },
    totalSGST:  { type: Number, default: 0 },
    totalIGST:  { type: Number, default: 0 },
    totalGST:   { type: Number, default: 0 },
    interState: { type: Boolean, default: false },
  },

  total:   { type: Number },
  dueDate: { type: Date },
  notes:   { type: String },
  pdfUrl:  { type: String },
  paidAt:  { type: Date },

}, { timestamps: true });

// Indexes
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ userId: 1, status: 1 });

// Auto invoice number + calculate totals
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Invoice').countDocuments({ userId: this.userId });
    this.invoiceNo = `INV-${Date.now()}-${count + 1}`;
  }
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.total = this.subtotal + (this.gstBreakdown?.totalGST || 0) - (this.discount || 0);
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);