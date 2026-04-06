const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const invoiceRoutes = require('../modules/invoice/invoice.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
const paymentRoutes = require('../modules/payment/payment.routes');
const subscriptionRoutes = require('../modules/subscription/subscription.routes');
const transactionRoutes  = require('../modules/transaction/transaction.routes');

router.use('/auth', authRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payment', paymentRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/transactions',  transactionRoutes);

module.exports = router;