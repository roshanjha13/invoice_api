const { options } = require('joi');
const Invoice = require('./invoice.model');

exports.createInvoice = async (data) => {
    return Invoice.create(data);
};

exports.findById = async (id, userId) => {
    return Invoice.findOne({ _id: id, userId })
};

exports.deleteById = async (id, userId) => {
    return Invoice.findOneAndDelete({ _id: id, userId })
};

exports.countByUser = async (userId) => {
    return Invoice.countDocuments({ userId })
};

exports.updateStatus = async (id, userId, status, extra = {}) => {
    return Invoice.findOneAndUpdate(
        { _id: id, userId},
        { status, ...extra },
        { new: true}
    );
};

exports.updateById = async (id, userId, data) => {
    return Invoice.findOneAndUpdate(
        { _id: id, userId},
        data,
        { new: true, runValidators: true }
    );
};

exports.findAllByUser = async (userId, filter = {}, options = {}) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const query = { userId, ...filter };

    const invoices = await Invoice.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Invoice.countDocuments(query);

    return { invoices, total, page: Number(page), limit: Number(limit) };    
}

exports.updatePaymentLink = async (id, userId, paymentId, paymentLink) => {
  return Invoice.findOneAndUpdate(
    { _id: id, userId },
    { paymentId, paymentLink },
    { new: true }
  );
};