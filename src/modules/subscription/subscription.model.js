const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const subscriptionSchema = new mongoose.Schema({
  _id:    { type: String, default: () => `sub_${uuidv4().replace(/-/g, '')}` },
  userId: { type: String, required: true, ref: 'User' },

  // Plan details
  plan:     { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], required: true },
  prevPlan: { type: String, default: null },

  // Razorpay details
  razorpaySubId:    { type: String, default: null },
  razorpayPlanId:   { type: String, default: null },
  razorpayCustomerId: { type: String, default: null },

  // Status
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'paused', 'pending'],
    default: 'active'
  },

  // Billing
  amount:        { type: Number, default: 0 },
  currency:      { type: String, default: 'INR' },
  billingCycle:  { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },

  // Dates
  startDate:     { type: Date, default: Date.now },
  endDate:       { type: Date, default: null },
  nextBillingAt: { type: Date, default: null },
  cancelledAt:   { type: Date, default: null },
  trialEndAt:    { type: Date, default: null },
  trialUsed: { type: Boolean, default: false },
  
  // Meta
  cancelReason:  { type: String, default: null },
  autoRenew:     { type: Boolean, default: true },


}, { timestamps: true });

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ razorpaySubId: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextBillingAt: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);