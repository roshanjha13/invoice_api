const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const { 
    createInvoiceValidation, 
    updateInvoiceValidation 
} = require('./invoice.validation');
const { 
    createInvoice, 
    getInvoices, 
    getInvoice, 
    updateInvoice, 
    deleteInvoice, 
    markPaid,
    sendInvoice,
    generatePDF
} = require('./invoice.controller');
const { apiKeyAuth, protect } = require('../../middlewares/auth.middleware');
const { planLimiter, pdfLimiter, emailLimiter } = require('../../middlewares/rateLimiter');
const { authorize, hasPermission } = require('../../middlewares/rbac');

router.use(apiKeyAuth);
router.use(planLimiter);

router.post('/',               validate(createInvoiceValidation),  createInvoice);
router.get('/',                getInvoices);
router.get('/:id',             getInvoice);
router.patch('/:id',           validate(updateInvoiceValidation),   updateInvoice);
router.delete('/:id',          deleteInvoice);
router.patch('/:id/mark-paid', markPaid);
router.get('/:id/pdf',         pdfLimiter,                          generatePDF);
router.post('/:id/send',       emailLimiter,                        sendInvoice);

module.exports = router;