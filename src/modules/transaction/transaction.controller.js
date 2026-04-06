const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const repo = require('./transaction.repository');

// Get All Transactions
exports.getAllTransactions = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;
  const result = await repo.findAllByUser(req.user._id, { page, limit, type });
  return success(res, result);
});

// Get Transaction Stats
exports.getTransactionStats = asyncHandler(async (req, res) => {
  const stats = await repo.getTransactionStats(req.user._id);
  return success(res, { stats });
});

// Get Monthly Transactions
exports.getMonthlyTransactions = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const data = await repo.getMonthlyTransactions(req.user._id, year);
  return success(res, { data, year });
});