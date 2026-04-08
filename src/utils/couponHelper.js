const calculateDiscount = (coupon, amount) => {
  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (amount * coupon.value) / 100;
    // Max discount cap
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }

  // Discount amount se zyada nahi ho sakta
  discount = Math.min(discount, amount);

  return {
    discount:       parseFloat(discount.toFixed(2)),
    finalAmount:    parseFloat((amount - discount).toFixed(2)),
    originalAmount: amount,
  };
};

const validateCoupon = (coupon, userId, plan, amount) => {
  // Active hai?
  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }

  // Expiry check
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return { valid: false, message: 'Coupon has expired' };
  }

  // Start date check
  if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
    return { valid: false, message: 'Coupon is not yet active' };
  }

  // Usage limit check
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  // Already used check
  if (coupon.usedBy.includes(userId)) {
    return { valid: false, message: 'Coupon already used by you' };
  }

  // Min amount check
  if (amount < coupon.minAmount) {
    return { valid: false, message: `Minimum amount required: ${coupon.minAmount}` };
  }

  // Plan check
  if (coupon.plans.length > 0 && !coupon.plans.includes(plan)) {
    return { valid: false, message: `Coupon not valid for ${plan} plan` };
  }

  return { valid: true };
};

module.exports = { calculateDiscount, validateCoupon };