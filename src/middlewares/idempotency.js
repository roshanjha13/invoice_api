const { client } = require('../config/redis');
const logger = require('../utils/logger');

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours

const idempotency = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Key nahi hai toh skip karo
  if (!idempotencyKey) return next();

  const redisKey = `idempotency:${req.user._id}:${idempotencyKey}`;

  try {
    // Redis mein check karo
    const cached = await client.get(redisKey);

    if (cached) {
      // Same response do
      logger.info(`Idempotency hit: ${idempotencyKey}`);
      const { statusCode, body } = JSON.parse(cached);
      return res.status(statusCode).json(body);
    }

    // Original response intercept karo
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Successful response save karo Redis mein
      if (res.statusCode < 400) {
        await client.setEx(
          redisKey,
          IDEMPOTENCY_TTL,
          JSON.stringify({ statusCode: res.statusCode, body })
        );
      }
      return originalJson(body);
    };

    next();
  } catch (err) {
    logger.error(`Idempotency error: ${err.message}`);
    next();
  }
};

module.exports = idempotency;