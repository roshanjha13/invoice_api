const logger = require('./logger');

const STATE = {
  CLOSED:   'CLOSED',   // Normal — sab kuch chal raha hai
  OPEN:     'OPEN',     // Service down — seedha error do
  HALF_OPEN: 'HALF_OPEN' // Testing — ek request try karo
};

class CircuitBreaker {
  constructor(options = {}) {
    this.name            = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 5;    // kitni failures pe OPEN ho
    this.successThreshold = options.successThreshold || 2;    // kitni success pe CLOSED ho
    this.timeout         = options.timeout || 60000;          // kitni der OPEN rahe (ms)
    this.requestTimeout  = options.requestTimeout || 10000;   // request timeout (ms)

    // State
    this.state          = STATE.CLOSED;
    this.failureCount   = 0;
    this.successCount   = 0;
    this.lastFailureTime = null;
    this.nextAttemptAt  = null;

    // Stats
    this.stats = {
      totalRequests:  0,
      totalFailures:  0,
      totalSuccesses: 0,
      totalRejected:  0,
    };
  }

  // Main execute function
  async fire(fn, ...args) {
    this.stats.totalRequests++;

    // OPEN state — seedha error do
    if (this.state === STATE.OPEN) {
      if (Date.now() < this.nextAttemptAt) {
        this.stats.totalRejected++;
        logger.warn(`⚡ Circuit OPEN: ${this.name} — request rejected`);
        throw new Error(`Circuit breaker is OPEN for ${this.name}. Try again later.`);
      }
      // Timeout ho gaya — HALF_OPEN karo
      this._transitionTo(STATE.HALF_OPEN);
    }

    // HALF_OPEN — ek request try karo
    if (this.state === STATE.HALF_OPEN) {
      logger.info(`⚡ Circuit HALF_OPEN: ${this.name} — testing request`);
    }

    // Request execute karo with timeout
    try {
      const result = await this._executeWithTimeout(fn, args);
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);
      throw error;
    }
  }

  // Timeout wrapper
  _executeWithTimeout(fn, args) {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout: ${this.name}`));
      }, this.requestTimeout);

      try {
        const result = await fn(...args);
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  // Success handler
  _onSuccess() {
    this.stats.totalSuccesses++;
    this.failureCount = 0;

    if (this.state === STATE.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this._transitionTo(STATE.CLOSED);
      }
    }
  }

  // Failure handler
  _onFailure(error) {
    this.stats.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    logger.error(`⚡ Circuit failure: ${this.name} — ${error.message} (${this.failureCount}/${this.failureThreshold})`);

    if (this.state === STATE.HALF_OPEN) {
      this._transitionTo(STATE.OPEN);
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this._transitionTo(STATE.OPEN);
    }
  }

  // State transition
  _transitionTo(state) {
    const prev = this.state;
    this.state = state;

    if (state === STATE.OPEN) {
      this.nextAttemptAt = Date.now() + this.timeout;
      this.successCount  = 0;
      logger.error(`🔴 Circuit OPENED: ${this.name} — retry after ${this.timeout / 1000}s`);
    }

    if (state === STATE.CLOSED) {
      this.failureCount  = 0;
      this.successCount  = 0;
      this.nextAttemptAt = null;
      logger.info(`🟢 Circuit CLOSED: ${this.name} — recovered`);
    }

    if (state === STATE.HALF_OPEN) {
      logger.info(`🟡 Circuit HALF_OPEN: ${this.name} — testing`);
    }
  }

  // Stats get karo
  getStats() {
    return {
      name:           this.name,
      state:          this.state,
      failureCount:   this.failureCount,
      successCount:   this.successCount,
      nextAttemptAt:  this.nextAttemptAt,
      ...this.stats,
    };
  }

  // Manual reset
  reset() {
    this._transitionTo(STATE.CLOSED);
    this.stats = {
      totalRequests:  0,
      totalFailures:  0,
      totalSuccesses: 0,
      totalRejected:  0,
    };
  }
}

// Pre-configured circuit breakers
const emailBreaker = new CircuitBreaker({
  name:             'EmailService',
  failureThreshold: 3,
  successThreshold: 2,
  timeout:          30000,
  requestTimeout:   10000,
});

const cloudinaryBreaker = new CircuitBreaker({
  name:             'CloudinaryService',
  failureThreshold: 3,
  successThreshold: 2,
  timeout:          30000,
  requestTimeout:   15000,
});

const razorpayBreaker = new CircuitBreaker({
  name:             'RazorpayService',
  failureThreshold: 5,
  successThreshold: 2,
  timeout:          60000,
  requestTimeout:   15000,
});

const webhookBreaker = new CircuitBreaker({
  name:             'WebhookService',
  failureThreshold: 5,
  successThreshold: 2,
  timeout:          30000,
  requestTimeout:   8000,
});

module.exports = {
  CircuitBreaker,
  emailBreaker,
  cloudinaryBreaker,
  razorpayBreaker,
  webhookBreaker,
};