const express = require('express');
const router = express.Router();

const { 
    getStats, 
    getStatusWise, 
    getMonthlyRevenue, 
    getTopClients, 
    getGSTSummary,
    exportGSTCSV,
    exportInvoicesCSV
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


module.exports = router