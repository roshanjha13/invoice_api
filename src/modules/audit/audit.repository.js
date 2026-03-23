const Audit = require('./audit.model');

exports.createLog = async (data) => {
    return Audit.create(data)
}

exports.findByUser = async (userId, options = {}) => {
    const { page = 1, limit = 10} = options;
    const logs = await Audit.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Audit.countDocuments({ userId });
    return { logs, total, page:Number(page) };
}

exports.findAll = async (filter = {}, options = {}) => {
    const { page = 1, limit = 10} = options;
    const logs = await Audit.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Audit.countDocuments(filter);
    return { logs, total, page:Number(page) };
}