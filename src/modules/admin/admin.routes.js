const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getAllInvoices, 
    changeUserPlan, 
    toggleUserStatus 
} = require('./admin.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac');
const validate = require('../../middlewares/validate');
const Joi = require('joi');

router.use(protect);
router.use(authorize('admin'));

router.get('/users',                    getAllUsers);
router.patch('/users/:id/toggle-status',toggleUserStatus);
router.patch('/users/:id/plan',          validate(Joi.object({
  plan: Joi.string().valid('free', 'starter', 'pro', 'enterprise').required()
})), changeUserPlan);

router.get('/invoices',                  getAllInvoices);

module.exports = router;