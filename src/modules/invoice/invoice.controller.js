const { success, error } = require('../../utils/response');
const msg = require('../../config/constant');
const asyncHandler = require('../../utils/asyncHandler');
const repo = require('./invoice.repository');
const userRepo = require('../auth/auth.repository');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const { addEmailJob } = require('../../queues/jobs/email.jobs');
const { addWebhookJob } = require('../../queues/jobs/webhook.job');

exports.createInvoice = asyncHandler(async (req, res, next) => {
    const invoice = await respo.createInvoice({
        ...req.body,
        userId: req.user._id
    });

    await userRepo.incrementInvoiceCount(req.user._id);

    return success(req, { invoice }, msg.CREATED);
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
    
    return success(res, { invoide: updated});
})

exports.generatePDF = asyncHandler(async (req, res, next) => {
    const invoice = await repo.findById(
        req.params.id,
        req.user._id
    )
    if(!invoice) return next(error(res, msg.INVOICE_NOT_FOUND, msg.NOT_FOUND));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNo}.pdf`);

    await generateInvoicePDF(invoice, res);
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

    return success(res, { message: msg.INVOICE_SENT });
})