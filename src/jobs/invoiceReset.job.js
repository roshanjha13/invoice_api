const cron = require('node-cron');
const User = require('../modules/auth/auth.model');
const Subscription = require('../modules/subscription/subscription.model');
const logger = require('../utils/logger');

// Har mahine 1 tarikh ko midnight — invoice count reset
const startInvoiceResetJob = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      logger.info('Monthly invoice count reset started');
      await User.updateMany(
        { plan: { $ne: 'enterprise' } },
        { $set: { invoiceCount: 0 } }
      );
      logger.info('Monthly invoice count reset complete');
    } catch (error) {
      logger.error(`Invoice reset error: ${error.message}`);
    }
  });
  logger.info('Invoice reset cron job started');
};

// Har din midnight — trial expiry check
const startTrialExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Trial expiry check started');

      const expiredTrials = await Subscription.find({
        status:     'active',
        trialEndAt: { $lte: new Date() },
        autoRenew:  false,
      });

      for (const sub of expiredTrials) {
        await Subscription.findByIdAndUpdate(sub._id, { status: 'expired' });
        await User.findByIdAndUpdate(sub.userId, { plan: 'free' });
        logger.info(`Trial expired: ${sub.userId}`);
      }

      logger.info(`Trial expiry check complete — ${expiredTrials.length} expired`);
    } catch (error) {
      logger.error(`Trial expiry error: ${error.message}`);
    }
  });
  logger.info('Trial expiry cron job started');
};

module.exports = { startInvoiceResetJob, startTrialExpiryJob };