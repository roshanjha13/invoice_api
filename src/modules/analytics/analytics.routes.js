const express = require('express');
const router = express.Router();

const { 
    getStats, 
    getStatusWise, 
    getMonthlyRevenue, 
    getTopClients, 
    getGSTSummary,
    exportGSTCSV,
    exportInvoicesCSV,
    getPaymentStatusWise,
    getMonthlyPaymentRevenue,
    getPaymentStats
} = require('./analytics.controller');

const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac');

router.use(protect)

router.get('/stats',                getStats);
router.get('/status',               getStatusWise);
router.get('/monthly-revenue',      getMonthlyRevenue);
router.get('/top-clients',          getTopClients);
router.get('/gst-summary',          getGSTSummary);
router.get('/export/invoices',      exportInvoicesCSV);
router.get('/export/gst',           exportGSTCSV);

router.get('/payment-stats',        getPaymentStats);
router.get('/payment-monthly',      getMonthlyPaymentRevenue);
router.get('/payment-status',       getPaymentStatusWise);

module.exports = router