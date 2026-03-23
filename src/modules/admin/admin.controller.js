const asyncHandler = require('../../utils/asyncHandler');
const {} = require('../../utils/response');
const msg = require('../../config/constant');
const repo = require('./admin.repository');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await repo.findAllUsers({}, { page, limit });
  return success(res, result);
});

exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await repo.findUserById(req.params.id);
  if (!user) return next(error(res, msg.USER_NOT_FOUND, msg.NOT_FOUND_CODE));

  const updated = await repo.updateUserStatus(req.params.id, !user.isActive);
  return success(res, {
    message: updated.isActive ? msg.USER_ACTIVATED : msg.USER_BANNED,
    isActive: updated.isActive
  });
});

exports.changeUserPlan = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  const user = await repo.findUserById(req.params.id);
  if (!user) return next(error(res, msg.USER_NOT_FOUND, msg.NOT_FOUND_CODE));

  const updated = await repo.updateUserPlan(req.params.id, plan);
  return success(res, { message: msg.PLAN_UPDATED, plan: updated.plan });
});

exports.getAllInvoices = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const result = await repo.findAllInvoices(filter, { page, limit });
  return success(res, result);
});

