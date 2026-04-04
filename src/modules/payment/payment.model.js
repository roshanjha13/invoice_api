const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentSchema = new mongoose.Schema({
  _id:           { type: String, default: () => `pay_${uuidv4().replace(/-/g, '')}` },
  invoiceId:     { type: String, required: true, ref: 'Invoice' },
  userId:        { type: String, required: true, ref: 'User' },

  // Razorpay details
  razorpayOrderId:   { type: String, unique: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  // Payment details
  amount:        { type: Number, required: true },
  currency:      { type: String, default: 'INR' },
  status:        { type: String, enum: ['created', 'attempted', 'paid', 'failed', 'refunded'], default: 'created' },

  // Refund details
  refundId:      { type: String, default: null },
  refundAmount:  { type: Number, default: 0 },
  refundReason:  { type: String, default: null },
  refundedAt:    { type: Date, default: null },

  // Meta
  description:   { type: String },
  notes:         { type: mongoose.Schema.Types.Mixed },
  paidAt:        { type: Date, default: null },
  failureReason: { type: String, default: null },

}, { timestamps: true });

// Indexes
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
