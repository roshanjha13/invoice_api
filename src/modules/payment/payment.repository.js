const Payment = require('./payment.model');

exports.createPayment = async (data) => {
  return Payment.create(data);
};

exports.findById = async (id) => {
  return Payment.findById(id);
};

exports.findByInvoiceId = async (invoiceId) => {
  return Payment.findOne({ invoiceId });
};

exports.findByRazorpayOrderId = async (orderId) => {
  return Payment.findOne({ razorpayOrderId: orderId });
};

exports.findAllByUser = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Payment.countDocuments({ userId });
  return { payments, total, page: Number(page) };
};

exports.updatePaymentStatus = async (id, data) => {
  return Payment.findByIdAndUpdate(id, data, { new: true });
};

exports.updateByOrderId = async (orderId, data) => {
  return Payment.findOneAndUpdate(
    { razorpayOrderId: orderId },
    data,
    { new: true }
  );
};