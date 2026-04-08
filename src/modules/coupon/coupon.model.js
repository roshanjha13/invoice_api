const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const couponSchema = new mongoose.Schema({
  _id:          { type: String, default: () => `coup_${uuidv4().replace(/-/g, '')}` },
  code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:  { type: String },

  // Discount type
  type:         { type: String, enum: ['percentage', 'fixed'], required: true },
  value:        { type: Number, required: true },
  maxDiscount:  { type: Number, default: null }, // percentage type ke liye max cap

  // Restrictions
  minAmount:    { type: Number, default: 0 },
  plans:        { type: [String], enum: ['starter', 'pro', 'enterprise'], default: [] }, // empty = all plans
  
  // Usage
  usageLimit:   { type: Number, default: null }, // null = unlimited
  usedCount:    { type: Number, default: 0 },
  usedBy:       [{ type: String, ref: 'User' }],

  // Validity
  isActive:     { type: Boolean, default: true },
  startDate:    { type: Date, default: Date.now },
  expiryDate:   { type: Date, default: null },

}, { timestamps: true });

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);