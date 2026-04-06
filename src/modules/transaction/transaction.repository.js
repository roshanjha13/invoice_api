const Transaction = require('./transaction.model');

exports.createTransaction = async (data) => {
  return Transaction.create(data);
};

exports.findAllByUser = async (userId, options = {}) => {
  const { page = 1, limit = 10, type } = options;
  const filter = { userId };
  if (type) filter.type = type;

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Transaction.countDocuments(filter);
  return { transactions, total, page: Number(page) };
};

exports.findById = async (id) => {
  return Transaction.findById(id);
};

exports.getTransactionStats = async (userId) => {
  return Transaction.aggregate([
    { $match: { userId, status: 'success' } },
    {
      $group: {
        _id:          '$type',
        totalAmount:  { $sum: '$amount' },
        count:        { $sum: 1 },
      }
    }
  ]);
};

exports.getMonthlyTransactions = async (userId, year) => {
  return Transaction.aggregate([
    {
      $match: {
        userId,
        status: 'success',
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id:    { month: { $month: '$createdAt' }, type: '$type' },
        amount: { $sum: '$amount' },
        count:  { $sum: 1 },
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
};