const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const repo = require('./audit.repository');

exports.getMyLogs = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await repo.findByUser(req.user._id, { page, limit });
    return success(res, result);
});

exports.getALLLogs = asyncHandler(async (req, res) => {
    const { page, limit, action, module } = req.query;
    const filter = {};
    if(action) filter.action = action;
    if(module) filter.module = module;

    const result = await repo.findAll(filter, { page, limit });
    return success(res, result);
})
