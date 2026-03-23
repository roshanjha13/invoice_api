const Invoice = require('../invoice/invoice.model');

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