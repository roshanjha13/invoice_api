const { error } = require('../utils/response');
const HTTP = require('../utils/httpStatus');
const logger = require('../utils/logger');

const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      logger.warn(`⏱️ Request timeout: ${req.method} ${req.originalUrl}`);

      if (!res.headersSent) {
        return res.status(HTTP.SERVER_ERROR).json({
          success: false,
          message: 'Request timeout — please try again',
        });
      }
    }, timeout);

    // Request complete hone pe timer clear karo
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

module.exports = requestTimeout;