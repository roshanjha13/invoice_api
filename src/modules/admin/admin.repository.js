const User = require('../auth/auth.model');
const Invoice = require('../../config/constant');

exports.findAllUsers = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1})
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await User.countDocuments(filter);
    return { users, total, page: Number(page) };
};

exports.findUserById = async (id) => {
    return User.findById(id).select('-password');
};

exports.updateUserStatus = async (id, isActive) => {
    return User.findByIdAndUpdate(id, { isActive }, { new: true });
};

exports.updateUserStatus = async (id, plan) => {
    return User.findByIdAndUpdate(id, { plan }, { new: true });
};

exports.findAllUsers = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const invoices = await Invoice.find(filter)
        .sort({ createdAt: -1})
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Invoice.countDocuments(filter);
    return { invoices, total, page: Number(page) };
};