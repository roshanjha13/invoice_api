const logger = require('./logger');

const DEFAULT_OPTIONS = {
  retries:     3,
  delay:       1000,    // 1 second
  multiplier:  2,       // exponential backoff
  maxDelay:    10000,   // max 10 seconds
  onRetry:     null,    // callback on retry
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (fn, options = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError;
  let delay = config.delay;

  for (let attempt = 1; attempt <= config.retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Last attempt — throw karo
      if (attempt > config.retries) {
        logger.error(`❌ All ${config.retries} retries failed: ${error.message}`);
        throw error;
      }

      logger.warn(`⚠️ Attempt ${attempt} failed: ${error.message} — retrying in ${delay}ms`);

      // onRetry callback
      if (config.onRetry) {
        await config.onRetry(error, attempt);
      }

      // Wait karo
      await sleep(delay);

      // Exponential backoff
      delay = Math.min(delay * config.multiplier, config.maxDelay);
    }
  }

  throw lastError;
};

module.exports = { withRetry };