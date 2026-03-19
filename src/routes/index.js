const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const invoiceRoutes = require('../modules/invoice/invoice.routes');

router.use('/auth', authRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;