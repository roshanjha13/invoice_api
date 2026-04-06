const Subscription = require('./subscription.model');

exports.createSubscription = async (data) => {
  return Subscription.create(data);
};

exports.findByUserId = async (userId) => {
  return Subscription.findOne({ userId, status: 'active' });
};

exports.findByRazorpayId = async (razorpaySubscriptionId) => {
  return Subscription.findOne({ razorpaySubscriptionId });
};

exports.findAllByUser = async (userId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const subscriptions = await Subscription.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Subscription.countDocuments({ userId });
  return { subscriptions, total, page: Number(page) };
};

exports.updateSubscription = async (id, data) => {
  return Subscription.findByIdAndUpdate(id, data, { new: true });
};

exports.updateByRazorpayId = async (razorpaySubscriptionId, data) => {
  return Subscription.findOneAndUpdate(
    { razorpaySubscriptionId },
    data,
    { new: true }
  );
};

exports.cancelSubscription = async (userId) => {
  return Subscription.findOneAndUpdate(
    { userId, status: 'active' },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
};