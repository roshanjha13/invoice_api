const crypto = require('crypto');
const razorpay = require('../../config/razorpay');
const asyncHandler = require('../../utils/asyncHandler');
const { success, error } = require('../../utils/response');
const HTTP = require('../../utils/httpStatus');
const msg = require('../../config/constant');
const repo = require('./payment.repository');
const invoiceRepo = require('../invoice/invoice.repository');
const { auditLog, AUDIT_ACTIONS, AUDIT_MODULES } = require('../../utils/auditLogger');
const { addEmailJob } = require('../../queues/jobs/email.jobs');
const logger = require('../../utils/logger');

// Create Razorpay Order
exports.createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { invoiceId } = req.body;

  // Invoice check karo
  const invoice = await invoiceRepo.findById(invoiceId, req.user._id);
  if (!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, HTTP.NOT_FOUND));

  if (invoice.status === 'paid') {
    return next(error(res, msg.INVOICE_ALREADY_PAID, HTTP.BAD_REQUEST));
  }

  // Razorpay order banao
  const order = await razorpay.orders.create({
    amount:   Math.round(invoice.total * 100), // paise mein
    currency: invoice.currency || 'INR',
    receipt:  invoice.invoiceNo,
    notes: {
      invoiceId:  invoice._id,
      invoiceNo:  invoice.invoiceNo,
      clientName: invoice.clientName,
    }
  });

  // Payment record banao
  const payment = await repo.createPayment({
    invoiceId:       invoice._id,
    userId:          req.user._id,
    razorpayOrderId: order.id,
    amount:          invoice.total,
    currency:        invoice.currency || 'INR',
    description:     `Payment for ${invoice.invoiceNo}`,
    notes:           order.notes,
  });

  await invoiceRepo.updatePaymentLink(
    invoice._id,
    req.user._id,
    payment._id,
    `https://razorpay.com/payment/${order.id}`
  );


  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.CREATE_PAYMENT,
    AUDIT_MODULES.PAYMENT,
    `Payment order created: ${order.id}`,
    { invoiceId, orderId: order.id }
  );

  return success(res, {
    orderId:   order.id,
    amount:    order.amount,
    currency:  order.currency,
    paymentId: payment._id,
    keyId:     process.env.RAZORPAY_KEY_ID,
  }, HTTP.CREATED);
});

// Verify Payment
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // Signature verify karo
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    await repo.updateByOrderId(razorpayOrderId, {
      status:        'failed',
      failureReason: 'Invalid signature',
    });
    return next(error(res, msg.PAYMENT_INVALID_SIGNATURE, HTTP.BAD_REQUEST));
  }

  // Payment update karo
  const payment = await repo.updateByOrderId(razorpayOrderId, {
    razorpayPaymentId,
    razorpaySignature,
    status: 'paid',
    paidAt: new Date(),
  });

  // Invoice mark paid karo
  await invoiceRepo.updateStatus(
    payment.invoiceId,
    payment.userId,
    'paid',
    { paidAt: new Date() }
  );

  // Email bhejo
  const invoice = await invoiceRepo.findById(payment.invoiceId, payment.userId);
  if (invoice) await addEmailJob(invoice);

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.VERIFY_PAYMENT,
    AUDIT_MODULES.PAYMENT,
    `Payment verified: ${razorpayPaymentId}`,
    { orderId: razorpayOrderId, paymentId: razorpayPaymentId }
  );

  return success(res, {
    message:   msg.PAYMENT_SUCCESS,
    paymentId: razorpayPaymentId,
  });
});

// Razorpay Webhook
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Webhook signature verify karo
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return next(error(res, msg.WEBHOOK_INVALID_SIGNATURE, HTTP.BAD_REQUEST));
  }

  const { event, payload } = req.body;

  switch (event) {
    case 'payment.captured':
      await repo.updateByOrderId(
        payload.payment.entity.order_id,
        { status: 'paid', paidAt: new Date() }
      );
      logger.info(`✅ Payment captured: ${payload.payment.entity.id}`);
      break;

    case 'payment.failed':
      await repo.updateByOrderId(
        payload.payment.entity.order_id,
        { status: 'failed', failureReason: payload.payment.entity.error_description }
      );
      logger.error(`❌ Payment failed: ${payload.payment.entity.id}`);
      break;

    case 'refund.created':
      await repo.updateByOrderId(
        payload.refund.entity.payment_id,
        {
          status:       'refunded',
          refundId:     payload.refund.entity.id,
          refundAmount: payload.refund.entity.amount / 100,
          refundedAt:   new Date(),
        }
      );
      logger.info(`✅ Refund created: ${payload.refund.entity.id}`);
      break;

    default:
      logger.info(`Webhook event: ${event}`);
  }

  return success(res, { received: true });
});

// Get Payment by Invoice
exports.getPaymentByInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await invoiceRepo.findById(req.params.invoiceId, req.user._id);
  if (!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, HTTP.NOT_FOUND));

  const payment = await repo.findByInvoiceId(req.params.invoiceId);
  if (!payment) return next(error(res, msg.PAYMENT_NOT_FOUND, HTTP.NOT_FOUND));

  return success(res, { payment });
});

// Get All Payments
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await repo.findAllByUser(req.user._id, { page, limit });
  return success(res, result);
});

// Refund Payment
exports.refundPayment = asyncHandler(async (req, res, next) => {
  const { reason, amount } = req.body;

  const payment = await repo.findById(req.params.id);
  if (!payment) return next(error(res, msg.PAYMENT_NOT_FOUND, HTTP.NOT_FOUND));

  if (payment.status !== 'paid') {
    return next(error(res, msg.PAYMENT_NOT_REFUNDABLE, HTTP.BAD_REQUEST));
  }

  // Razorpay refund
  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: amount ? Math.round(amount * 100) : Math.round(payment.amount * 100),
    notes:  { reason },
  });

  // Payment update karo
  await repo.updatePaymentStatus(payment._id, {
    status:       'refunded',
    refundId:     refund.id,
    refundAmount: refund.amount / 100,
    refundReason: reason,
    refundedAt:   new Date(),
  });

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.REFUND_PAYMENT,
    AUDIT_MODULES.PAYMENT,
    `Payment refunded: ${payment.razorpayPaymentId}`,
    { paymentId: payment._id, refundId: refund.id }
  );

  return success(res, { message: msg.REFUND_SUCCESS, refundId: refund.id });
});