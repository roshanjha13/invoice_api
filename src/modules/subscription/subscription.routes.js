const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate');
const Joi = require('joi');
const {
  startTrial,
  createSubscription,
  getSubscription,
  getAllSubscriptions,
  changePlan,
  cancelSubscription,
  handleSubscriptionWebhook,
} = require('./subscription.controller');

// Webhook — no auth
router.post('/webhook', handleSubscriptionWebhook);

// Protected routes
router.use(protect);

router.post('/trial', validate(Joi.object({
  plan: Joi.string().valid('starter', 'pro', 'enterprise').required()
})), startTrial);

router.post('/', validate(Joi.object({
  plan:         Joi.string().valid('starter', 'pro', 'enterprise').required(),
  billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
})), createSubscription);

router.get('/',        getAllSubscriptions);
router.get('/current', getSubscription);

router.patch('/change-plan', validate(Joi.object({
  plan: Joi.string().valid('starter', 'pro', 'enterprise').required()
})), changePlan);

router.post('/cancel', validate(Joi.object({
  reason: Joi.string().optional()
})), cancelSubscription);

module.exports = router;