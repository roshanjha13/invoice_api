const razorpay = require('../../config/razorpay');
const asyncHandler = require('../../utils/asyncHandler');
const { success, error } = require('../../utils/response');
const msg = require('../../config/constant');
const repo = require('./subscription.repository');
const userRepo = require('../auth/auth.repository');
const transactionRepo = require('../transaction/transaction.repository');
const { getPlan, isValidPlan } = require('../../config/plans');
const { auditLog, AUDIT_ACTIONS, AUDIT_MODULES } = require('../../utils/auditLogger');
const logger = require('../../utils/logger');
const crypto = require('crypto');

// Start Trial
exports.startTrial = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;

  if (!isValidPlan(plan) || plan === 'free') {
    return next(error(res, 'Invalid plan for trial', msg.BAD_REQUEST));
  }

  // Trial already use kiya hai?
  const user = await userRepo.findById(req.user._id);
  if (user.trialUsed) {
    return next(error(res, msg.TRIAL_ALREADY_USED, msg.BAD_REQUEST));
  }

  // Active subscription check karo
  const existing = await repo.findByUserId(req.user._id);
  if (existing) {
    return next(error(res, 'Active subscription already exists', msg.BAD_REQUEST));
  }

  const planConfig = getPlan(plan);
  const trialEndAt = new Date(Date.now() + planConfig.trialDays * 24 * 60 * 60 * 1000);

  // Subscription banao
  const subscription = await repo.createSubscription({
    userId:        req.user._id,
    plan,
    status:        'active',
    amount:        0,
    currency:      'INR',
    billingCycle:  'monthly',
    startDate:     new Date(),
    endDate:       trialEndAt,
    trialEndAt,
    autoRenew:     false,
  });

  // User update karo
  await userRepo.updateTrialInfo(req.user._id, trialEndAt);

  // Transaction log
  await transactionRepo.createTransaction({
    userId:      req.user._id,
    type:        'subscription_created',
    amount:      0,
    currency:    'INR',
    status:      'success',
    description: `Trial started: ${plan} — ${planConfig.trialDays} days`,
    metadata:    { subscriptionId: subscription._id, trialEndAt },
  });

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.CREATE_SUBSCRIPTION,
    AUDIT_MODULES.SUBSCRIPTION,
    `Trial started: ${plan}`,
    { subscriptionId: subscription._id }
  );

  return success(res, {
    message:    msg.TRIAL_STARTED,
    plan,
    trialEndAt,
    trialDays:  planConfig.trialDays,
  }, msg.CREATED);
});

// Create Subscription
exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { plan, billingCycle = 'monthly' } = req.body;

  if (!isValidPlan(plan) || plan === 'free') {
    return next(error(res, 'Invalid plan selected', msg.BAD_REQUEST));
  }

  const planConfig = getPlan(plan);

  if (!planConfig.razorpayPlanId) {
    return next(error(res, 'Plan not configured', msg.BAD_REQUEST));
  }

  // Existing subscription check karo
  const existing = await repo.findByUserId(req.user._id);
  if (existing && existing.status === 'active') {
    return next(error(res, 'Active subscription already exists', msg.BAD_REQUEST));
  }

  // Razorpay subscription banao
  const subscription = await razorpay.subscriptions.create({
    plan_id:         planConfig.razorpayPlanId,
    customer_notify: 1,
    total_count:     billingCycle === 'yearly' ? 1 : 12,
    notes: {
      userId: req.user._id,
      plan,
      billingCycle,
    }
  });

  const nextBillingAt = new Date(
    Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
  );

  // DB mein save karo
  const sub = await repo.createSubscription({
    userId:               req.user._id,
    plan,
    razorpaySubId:        subscription.id,
    razorpayPlanId:       planConfig.razorpayPlanId,
    status:               'pending',
    amount:               planConfig.price,
    currency:             planConfig.currency,
    billingCycle,
    startDate:            new Date(),
    nextBillingAt,
    autoRenew:            true,
  });

  // Transaction log
  await transactionRepo.createTransaction({
    userId:      req.user._id,
    type:        'subscription_created',
    amount:      planConfig.price,
    currency:    planConfig.currency,
    status:      'pending',
    description: `Subscription created: ${plan}`,
    metadata:    { subscriptionId: sub._id },
  });

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.CREATE_SUBSCRIPTION,
    AUDIT_MODULES.SUBSCRIPTION,
    `Subscription created: ${plan}`,
    { subscriptionId: sub._id }
  );

  return success(res, {
    subscriptionId:  subscription.id,
    plan,
    amount:          planConfig.price,
    currency:        planConfig.currency,
    billingCycle,
    nextBillingAt,
    keyId:           process.env.RAZORPAY_KEY_ID,
  }, msg.CREATED);
});

// Get Current Subscription
exports.getSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await repo.findByUserId(req.user._id);
  if (!subscription) return next(error(res, 'No active subscription', msg.NOT_FOUND_CODE));
  return success(res, { subscription });
});

// Get All Subscriptions
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await repo.findAllByUser(req.user._id, { page, limit });
  return success(res, result);
});

// Upgrade/Downgrade Plan
exports.changePlan = asyncHandler(async (req, res, next) => {
  const { plan } = req.body;

  if (!isValidPlan(plan) || plan === 'free') {
    return next(error(res, 'Invalid plan', msg.BAD_REQUEST));
  }

  const subscription = await repo.findByUserId(req.user._id);
  if (!subscription) return next(error(res, 'No active subscription', msg.NOT_FOUND_CODE));

  const prevPlan = subscription.plan;
  const planConfig = getPlan(plan);

  // Razorpay pe update karo
  await razorpay.subscriptions.update(subscription.razorpaySubId, {
    plan_id: planConfig.razorpayPlanId,
  });

  // DB update karo
  await repo.updateSubscription(subscription._id, {
    plan,
    prevPlan,
    amount: planConfig.price,
  });

  // User plan update karo
  await userRepo.updateUserPlan(req.user._id, plan);

  // Transaction log
  await transactionRepo.createTransaction({
    userId:      req.user._id,
    type:        'subscription_created',
    amount:      planConfig.price,
    currency:    planConfig.currency,
    status:      'success',
    description: `Plan changed: ${prevPlan} → ${plan}`,
  });

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.CREATE_SUBSCRIPTION,
    AUDIT_MODULES.SUBSCRIPTION,
    `Plan changed: ${prevPlan} → ${plan}`,
  );

  return success(res, {
    message:  `Plan changed from ${prevPlan} to ${plan}`,
    plan,
    prevPlan,
  });
});

// Cancel Subscription
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const subscription = await repo.findByUserId(req.user._id);
  if (!subscription) return next(error(res, 'No active subscription', msg.NOT_FOUND_CODE));

  // Razorpay pe cancel karo
  if (subscription.razorpaySubId) {
    await razorpay.subscriptions.cancel(subscription.razorpaySubId);
  }

  // DB update karo
  await repo.updateSubscription(subscription._id, {
    status:       'cancelled',
    cancelledAt:  new Date(),
    cancelReason: reason || 'User requested',
    autoRenew:    false,
  });

  // User plan free pe reset karo
  await userRepo.updateUserPlan(req.user._id, 'free');

  // Transaction log
  await transactionRepo.createTransaction({
    userId:      req.user._id,
    type:        'subscription_cancelled',
    amount:      0,
    currency:    'INR',
    status:      'success',
    description: `Subscription cancelled: ${subscription.plan}`,
    metadata:    { reason },
  });

  // Audit log
  await auditLog(
    req,
    AUDIT_ACTIONS.CANCEL_SUBSCRIPTION,
    AUDIT_MODULES.SUBSCRIPTION,
    `Subscription cancelled: ${subscription.plan}`,
  );

  return success(res, { message: msg.CANCEL_SUBSCRIPTION });
});

// Webhook Handler
exports.handleSubscriptionWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return next(error(res, 'Invalid webhook signature', msg.BAD_REQUEST));
  }

  const { event, payload } = req.body;

  switch (event) {
    case 'subscription.activated':
      const activeSub = await repo.findByRazorpayId(payload.subscription.entity.id);
      if (activeSub) {
        await repo.updateByRazorpayId(payload.subscription.entity.id, { status: 'active' });
        await userRepo.updateUserPlan(activeSub.userId, activeSub.plan);
      }
      logger.info(`✅ Subscription activated: ${payload.subscription.entity.id}`);
      break;

    case 'subscription.charged':
      const chargedSub = await repo.findByRazorpayId(payload.subscription.entity.id);
      if (chargedSub) {
        await repo.updateByRazorpayId(payload.subscription.entity.id, {
          nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        await transactionRepo.createTransaction({
          userId:      chargedSub.userId,
          type:        'subscription_renewal',
          amount:      payload.payment.entity.amount / 100,
          currency:    payload.payment.entity.currency,
          status:      'success',
          razorpayId:  payload.payment.entity.id,
          description: `Subscription renewed: ${chargedSub.plan}`,
        });
      }
      logger.info(`✅ Subscription charged: ${payload.payment.entity.id}`);
      break;

    case 'subscription.cancelled':
      await repo.updateByRazorpayId(
        payload.subscription.entity.id,
        { status: 'cancelled', cancelledAt: new Date() }
      );
      logger.info(`✅ Subscription cancelled: ${payload.subscription.entity.id}`);
      break;

    case 'subscription.expired':
      const expiredSub = await repo.findByRazorpayId(payload.subscription.entity.id);
      if (expiredSub) {
        await repo.updateByRazorpayId(payload.subscription.entity.id, { status: 'expired' });
        await userRepo.updateUserPlan(expiredSub.userId, 'free');
      }
      logger.info(`✅ Subscription expired: ${payload.subscription.entity.id}`);
      break;

    default:
      logger.info(`Subscription webhook: ${event}`);
  }

  return success(res, { received: true });
});