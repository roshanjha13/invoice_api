const asyncHandler = require('../../utils/asyncHandler');
const { success, error } = require('../../utils/response');
const msg = require('../../config/constant');
const repo = require('./coupon.repository');
const { calculateDiscount, validateCoupon } = require('../../utils/couponHelper');
const { auditLog, AUDIT_ACTIONS, AUDIT_MODULES } = require('../../utils/auditLogger');

// Apply Coupon — user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, plan, amount } = req.body;

  const coupon = await repo.findByCode(code);
  if (!coupon) return next(error(res, 'Invalid coupon code', msg.NOT_FOUND_CODE));

  // Validate karo
  const validation = validateCoupon(coupon, req.user._id, plan, amount);
  if (!validation.valid) {
    return next(error(res, validation.message, msg.BAD_REQUEST));
  }

  // Discount calculate karo
  const result = calculateDiscount(coupon, amount);

  return success(res, {
    code:           coupon.code,
    type:           coupon.type,
    value:          coupon.value,
    originalAmount: result.originalAmount,
    discount:       result.discount,
    finalAmount:    result.finalAmount,
  });
});

// Verify + Apply — subscription ke time
exports.verifyCoupon = asyncHandler(async (req, res, next) => {
  const { code, plan, amount } = req.body;

  const coupon = await repo.findByCode(code);
  if (!coupon) return next(error(res, 'Invalid coupon code', msg.NOT_FOUND_CODE));

  const validation = validateCoupon(coupon, req.user._id, plan, amount);
  if (!validation.valid) {
    return next(error(res, validation.message, msg.BAD_REQUEST));
  }

  const result = calculateDiscount(coupon, amount);

  // Usage increment karo
  await repo.incrementUsage(code, req.user._id);

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.APPLY_COUPON,
    AUDIT_MODULES.COUPON,
    `Coupon applied: ${code}`,
    { code, discount: result.discount, finalAmount: result.finalAmount }
  );

  return success(res, {
    code:           coupon.code,
    originalAmount: result.originalAmount,
    discount:       result.discount,
    finalAmount:    result.finalAmount,
    message:        'Coupon applied successfully',
  });
});

// ── Admin Routes ──

// Create Coupon
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const existing = await repo.findByCode(req.body.code);
  if (existing) return next(error(res, 'Coupon code already exists', msg.CONFLICT));

  const coupon = await repo.createCoupon(req.body);
  return success(res, { coupon }, msg.CREATED);
});

// Get All Coupons
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await repo.findAll({ page, limit });
  return success(res, result);
});

// Update Coupon
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await repo.updateCoupon(req.params.id, req.body);
  if (!coupon) return next(error(res, 'Coupon not found', msg.NOT_FOUND_CODE));
  return success(res, { coupon });
});

// Delete Coupon
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await repo.deleteCoupon(req.params.id);
  if (!coupon) return next(error(res, 'Coupon not found', msg.NOT_FOUND_CODE));
  return success(res, { message: 'Coupon deleted successfully' });
});

// Toggle Active
exports.toggleCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await repo.findById(req.params.id);
  if (!coupon) return next(error(res, 'Coupon not found', msg.NOT_FOUND_CODE));

  const updated = await repo.updateCoupon(req.params.id, { isActive: !coupon.isActive });
  return success(res, {
    message: updated.isActive ? 'Coupon activated' : 'Coupon deactivated',
    isActive: updated.isActive,
  });
});