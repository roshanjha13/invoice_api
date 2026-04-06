const User = require('./auth.model');

exports.findByEmail = async (email) => {
    return User.findOne({ email });
};

exports.findByEmailWithPassword = async (email) => {
    return User.findOne({ email }).select('+password');
};

exports.findById = async (id) => {
    return User.findById({ id });
};

exports.createUser = async (data) => {
    return User.create(data);
};

exports.updateApiKey = async (id, apiKey) => {
    return User.findByIdAndUpdate(
        id,
        { apiKey },
        { new: true}
    )
}

exports.findByApiKey = async (apiKey) => {
    return User.findOne(
        { apiKey, isActive: true },
    )
}

exports.incrementInvoiceCount = async (id) => {
    return User.findByIdAndUpdate(id, { $inc: {invoiceCount: 1} });
}

exports.updateTrialInfo = async (id, trialEndAt) => {
  return User.findByIdAndUpdate(
    id,
    { trialUsed: true, trialEndAt, plan: 'starter' },
    { new: true }
  );
};

exports.updateUserPlan = async (id, plan) => {
  return User.findByIdAndUpdate(id, { plan }, { new: true });
};