const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
  _id:         { type: String, default: () => `txn_${uuidv4().replace(/-/g, '')}` },
  userId:      { type: String, required: true, ref: 'User' },
  type:        {
    type: String,
    enum: [
      'payment',
      'refund',
      'subscription_created',
      'subscription_renewal',
      'subscription_cancelled',
      'subscription_expired',
    ],
    required: true
  },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'INR' },
  status:      { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  razorpayId:  { type: String, default: null },
  invoiceId:   { type: String, ref: 'Invoice', default: null },
  description: { type: String },
  metadata:    { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ razorpayId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);