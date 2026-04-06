const Razorpay = require('razorpay');
const { razorpayBreaker } = require('../utils/circuitBreaker');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Circuit breaker wrap — orders
const createOrder = async (options) => {
  return razorpayBreaker.fire(() => razorpay.orders.create(options));
};

// Circuit breaker wrap — payments refund
const refundPayment = async (paymentId, options) => {
  return razorpayBreaker.fire(() => razorpay.payments.refund(paymentId, options));
};

// Circuit breaker wrap — subscriptions
const createSubscription = async (options) => {
  return razorpayBreaker.fire(() => razorpay.subscriptions.create(options));
};

const cancelSubscription = async (subscriptionId) => {
  return razorpayBreaker.fire(() => razorpay.subscriptions.cancel(subscriptionId));
};

const updateSubscription = async (subscriptionId, options) => {
  return razorpayBreaker.fire(() => razorpay.subscriptions.update(subscriptionId, options));
};

logger.info('✅ Razorpay initialized');

module.exports = {
  razorpay,
  createOrder,
  refundPayment,
  createSubscription,
  cancelSubscription,
  updateSubscription,
};