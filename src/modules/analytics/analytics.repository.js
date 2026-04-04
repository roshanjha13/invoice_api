const Invoice = require('../invoice/invoice.model');
const Payment = require('../payment/payment.model');
exports.getInvoiceStats = async (userId) => {
    const stats = await Invoice.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $group: {
                _id: null,
                totalInvoices: { 
                    $sum: 1 
                },
                totalInvoices: { 
                    $sum: '$total'
                },
                paidRevenue: { 
                    $sum: 
                    {
                        $cond: 
                        [
                            {
                                $eq: ['$status', 'paid']
                            }   
                            , '$total',0 
                        ],
                    } 
                },
                pendingAmount: { 
                    $sum: 
                    {
                        $cond: 
                        [
                            {
                                $eq: ['$status', 'sent']
                            }   
                            , '$total',0 
                        ],
                    } 
                },
                overdueAmount: { 
                    $sum: 
                    {
                        $cond: 
                        [
                            {
                                $eq: ['$status', 'overdue']
                            }
                        ],
                    } 
                },
                
            }
        }
    ]);

    return stats[0] || {};
}

exports.getStatusWiseCount = async (userId) => {
    return Invoice.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $group: {
                _id: '$status',
                count: { 
                    $sum: 1 
                },
                total: { 
                    $sum: '$total'
                },
            }
        }
    ]);
}

exports.getMonthlyRevenue = async (userId, year) => {
    return Invoice.aggregate([
        {
            $match: {
                userId,
                status: 'paid',
                createdAt:{
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { 
                    $month: 'createdAt'
                },
                revenue: { 
                    $sum: '$total'
                },
                count: { 
                    $sum: 1 
                },
            }
        },
        {
            $sort:{
                _id: 1
            }
        }
    ]);
}

exports.getTopClients = async (userId, limit = 5) => {
    return Invoice.aggregate([
        {
            $match: {
                userId,
                status: 'paid',
            }
        },
        {
            $group: {
                _id: '$clientEmail',
                clientName: {
                    $first: '$clientName'
                },
                totalAmount: { 
                    $sum: '$total'
                },
                count: { 
                    $sum: 1 
                },
            }
        },
        {
            $sort:{
                totalAmount: -1
            }
        },
        {
            $limit: limit
        }
    ]);
}

exports.getGSTSummary = async (userId) => {
    return Invoice.aggregate([
        {
            $match: {
                userId,
                status: 'paid',
            }
        },
        {
            $group: {
                _id: null,
                totalCGST: { 
                    $sum: '$gstBreakdown.totalCGST' 
                },
                totalSGST: { 
                    $sum: '$gstBreakdown.totalSGST' 
                },
                totalIGST: { 
                    $sum: '$gstBreakdown.totalIGST' 
                },
                totalGST: { 
                    $sum: '$gstBreakdown.totalGST' 
                },
            }
        }
    ]);
}

exports.findAllInvoicesForExport = async (userId, filter = {}) => {
  return Invoice.find({ userId, ...filter })
    .sort({ createdAt: -1 });
};

// Payment stats
exports.getPaymentStats = async (userId) => {
  const stats = await Payment.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id:            null,
        totalPayments:  { $sum: 1 },
        totalRevenue:   { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        totalRefunds:   { $sum: '$refundAmount' },
        failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        paidPayments:   { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
      }
    }
  ]);
  return stats[0] || {};
};

// Monthly payment revenue
exports.getMonthlyPaymentRevenue = async (userId, year) => {
  return Payment.aggregate([
    {
      $match: {
        userId,
        status: 'paid',
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id:     { $month: '$createdAt' },
        revenue: { $sum: '$amount' },
        count:   { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Payment status wise
exports.getPaymentStatusWise = async (userId) => {
  return Payment.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id:    '$status',
        count:  { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    }
  ]);
};