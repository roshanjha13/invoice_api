const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac');
const validate = require('../../middlewares/validate');
const {
  applyCoupon,
  verifyCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
} = require('./coupon.controller');
const {
  createCouponValidation,
  applyCouponValidation,
} = require('./coupon.validation');

router.use(protect);

// User routes
router.post('/apply',  validate(applyCouponValidation), applyCoupon);
router.post('/verify', validate(applyCouponValidation), verifyCoupon);

// Admin routes
router.post('/',              authorize('admin'), validate(createCouponValidation), createCoupon);
router.get('/',               authorize('admin'),                                   getAllCoupons);
router.patch('/:id',          authorize('admin'),                                   updateCoupon);
router.delete('/:id',         authorize('admin'),                                   deleteCoupon);
router.patch('/:id/toggle',   authorize('admin'),                                   toggleCoupon);

module.exports = router;