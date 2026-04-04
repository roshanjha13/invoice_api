const { success, error } = require('../../utils/response');
const msg = require('../../config/constant');
const asyncHandler = require('../../utils/asyncHandler');
const repo = require('./invoice.repository');
const userRepo = require('../auth/auth.repository');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const { addEmailJob } = require('../../queues/jobs/email.jobs');
const { addWebhookJob } = require('../../queues/jobs/webhook.job');
const { calculateInvoiceGST } =  require('../../utils/gstCalculator');
const {
    auditLog,
    AUDIT_ACTIONS,
    AUDIT_MODULES
} = require('../../utils/auditLogger')

const { uploadPDFToCloudinary } = require('../../utils/cloudinaryService');
const logger = require('../../utils/logger');

exports.createInvoice = asyncHandler(async (req, res, next) => {
    const {
        sellerState,
        clientState,
        items,
        discount,
        ...rest
    } = req.body

    const gst = calculateInvoiceGST(items, sellerState, clientState);
 
    const invoice = await repo.createInvoice({
        ...rest,
        items:        gst.items,
        userId:       req.user._id,
        sellerState,
        clientState,
        subtotal:     gst.subtotal,
        discount:     discount || 0,
        gstBreakdown: {
            totalCGST:  gst.totalCGST,
            totalSGST:  gst.totalSGST,
            totalIGST:  gst.totalIGST,
            totalGST:   gst.totalGST,
            interState: gst.interState,
        },
    });

    await userRepo.incrementInvoiceCount(req.user._id);

    await auditLog(
        req,
        AUDIT_ACTIONS.CREATE_INVOICE,
        AUDIT_MODULES.INVOICE,
        `Invoice created: ${invoice.invoiceNo}`,
        { invoiceId: invoice._id }
    );

    return success(res, { invoice }, msg.CREATED);
})

exports.getInvoices = asyncHandler(async (req, res, next) => {
    const {
        status,
        page,
        limit,
        sortBy,
        sortOrder
    } = req.query;

    const filter = {};
    if(status) filter.status = status;

    const result = await repo.findAllByUser(
        req.user._id,
        filter,
        {
            page,
            limit,
            sortBy,
            sortOrder
        }
    )

    return success(res, result);
})

exports.getInvoice = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    return success(res, { invoice });
})

exports.updateInvoice = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    if(invoice.status !== 'draft'){
        return next(error(res, msg.INVOICE_NOT_EDITABLE, msg.BAD_REQUEST));
    }

    const updated = await repo.updateById(req.params.id, req.user._id, req.body);
    
    return success(res, { invoice: updated });
})

exports.deleteInvoice = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    if(invoice.status !== 'paid'){
        return next(error(res, msg.INVOICE_PAID_DELETE, msg.BAD_REQUEST));
    }

    await repo.deleteById(req.params.id, req.user._id);

    await auditLog(
        req,
        AUDIT_ACTIONS.DELETE_INVOICE,
        AUDIT_MODULES.INVOICE,
        `Invoice deleted: ${invoice.invoiceNo}`,
        { invoiceId: req.params.id }
    );

    
    return success(res, { message: msg.INVOICE_DELETED});
})

exports.markPaid = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    if(invoice.status === 'paid'){
        return next(error(res, msg.INVOICE_ALREADY_PAID, msg.BAD_REQUEST));
    }

    const updated = await repo.updateStatus(
        req.params.id, 
        req.user._id,
        'paid',
        {
            paidAt: new Date()
        }
    );
    
    await auditLog(
        req,
        AUDIT_ACTIONS.MARK_PAID,
        AUDIT_MODULES.INVOICE,
        `Invoice marked as paid: ${updated.invoiceNo}`,
        { invoiceId: req.params.id }
    );

    return success(res, { invoide: updated });
})

exports.generatePDF = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNo}.pdf`);

    const pdfStream = await generateInvoicePDF(invoice, res);
    
    if(!invoice.pdfUrl){
        uploadPDFToCloudinary(pdfStream, invoice.invoiceNo)
            .then(url => repo.updateById(invoice._id, invoice.userId, { pdfUrl: url }))
            .catch(err => logger.error(`PDF upload failed: ${err.message}`))
    }
})

exports.sendInvoice = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    if (invoice.status === 'paid') {
        return next(error(res, msg.INVOICE_ALREADY_PAID, msg.BAD_REQUEST))
    }

    await addEmailJob(invoice);

    await repo.updateStatus(req.params.id, req.user._id, 'sent');

    if(req.user.webhookUrl) {
        await addWebhookJob('invoice.sent', invoice, req.user.webhookUrl);
    }

    await auditLog(
        req,
        AUDIT_ACTIONS.SEND_INVOICE,
        AUDIT_MODULES.INVOICE,
        `Invoice sent: ${invoice.invoiceNo}`,
        { invoiceId: req.params.id }
    );

    return success(res, { message: msg.INVOICE_SENT });
})