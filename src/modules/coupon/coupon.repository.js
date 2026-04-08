const Coupon = require('./coupon.model');

exports.createCoupon = async (data) => {
  return Coupon.create(data);
};

exports.findByCode = async (code) => {
  return Coupon.findOne({ code: code.toUpperCase() });
};

exports.findById = async (id) => {
  return Coupon.findById(id);
};

exports.findAll = async (options = {}) => {
  const { page = 1, limit = 10 } = options;
  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Coupon.countDocuments();
  return { coupons, total, page: Number(page) };
};

exports.incrementUsage = async (code, userId) => {
  return Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    {
      $inc: { usedCount: 1 },
      $push: { usedBy: userId },
    },
    { new: true }
  );
};

exports.updateCoupon = async (id, data) => {
  return Coupon.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteCoupon = async (id) => {
  return Coupon.findByIdAndDelete(id);
};