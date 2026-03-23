const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const repo = require('./analytics.repository');
const { 
    exportGSTCSV, 
    exportInvoicesCSV 
} = require('../../utils/csvExporter');

exports.getStats = asyncHandler(async (req,res) => {
    const stats = await repo.getInvoiceStats(req.user._id);
    return success(res, { stats });
})

exports.getStatusWise = asyncHandler(async (req,res) => {
    const data = await repo.getStatusWiseCount(req.user._id);
    return success(res, { data });
})

exports.getMonthlyRevenue = asyncHandler(async (req,res) => {
    const year = req.query.year || new Date().getFullYear();
    const data = await repo.getMonthlyRevenue(req.user._id, year);
    return success(res, { data, year });
})

exports.getTopClients = asyncHandler(async (req,res) => {
    const limit = req.query.limit || 5
    const data = await repo.getTopClients(req.user._id, limit);
    return success(res, { data });
})

exports.getGSTSummary = asyncHandler(async (req,res) => {
    const data = await repo.getGSTSummary(req.user._id);
    return success(res, { gst: data[0] || {} });
})

exports.exportInvoicesCSV = asyncHandler(async (req, res) => {
  const invoices = await repo.findAllInvoicesForExport(req.user._id);
  const csv = exportInvoicesCSV(invoices);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
  res.send(csv);
});

exports.exportGSTCSV = asyncHandler(async (req, res) => {
  const invoices = await repo.findAllInvoicesForExport(
    req.user._id,
    { status: 'paid' }
  );
  const csv = exportGSTCSV(invoices);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=gst-report.csv');
  res.send(csv);
});