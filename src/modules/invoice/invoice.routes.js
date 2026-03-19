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
    markPaid 
} = require('./invoice.controller');
const { apiKeyAuth } = require('../../middlewares/auth.middleware');
const { planLimiter } = require('../../middlewares/rateLimiter');

router.use(apiKeyAuth);
router.use(planLimiter);

router.post('/',               validate(createInvoiceValidation), createInvoice);
router.get('/',                getInvoices);
router.get('/:id',             getInvoice);
router.patch('/:id',           validate(updateInvoiceValidation), updateInvoice);
router.delete('/:id',          deleteInvoice);
router.patch('/:id/mark-paid', markPaid);

module.exports = router;