const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentByInvoice,
  getAllPayments,
  refundPayment,
} = require('./payment.controller');
const {
  createPaymentValidation,
  verifyPaymentValidation,
  refundValidation,
} = require('./payment.validation');
const idempotency = require('../../middlewares/idempotency');

// Webhook — no auth (Razorpay se aata hai)
router.post('/webhook', handleWebhook);

// Protected routes
router.use(protect);

router.post('/create-order', idempotency, validate(createPaymentValidation),  createPaymentOrder);
router.post('/verify',       idempotency,       validate(verifyPaymentValidation),   verifyPayment);
router.get('/',                                                     getAllPayments);
router.get('/invoice/:invoiceId',                                   getPaymentByInvoice);
router.post('/:id/refund',    authorize('admin'), validate(refundValidation), refundPayment);

module.exports = router;