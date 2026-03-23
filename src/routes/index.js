const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const invoiceRoutes = require('../modules/invoice/invoice.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');

router.use('/auth', authRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;