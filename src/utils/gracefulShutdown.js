const logger = require('./logger');

const gracefulShutdown = (server, options = {}) => {
  const {
    timeout  = 30000, // 30 sec wait
    signals  = ['SIGTERM', 'SIGINT', 'SIGUSR2'],
  } = options;

  const shutdown = async (signal) => {
    logger.info(`\n🔴 ${signal} received — starting graceful shutdown...`);

    // Naye requests accept karna band karo
    server.close(async () => {
      logger.info('✅ HTTP server closed');

      try {
        // MongoDB close karo
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('✅ MongoDB connection closed');

        // Redis close karo
        const { client } = require('../config/redis');
        await client.quit();
        logger.info('✅ Redis connection closed');

        // BullMQ workers close karo
        const emailWorker   = require('../queues/workers/email.worker');
        const pdfWorker     = require('../queues/workers/pdf.worker');
        const webhookWorker = require('../queues/workers/webhook.worker');

        await emailWorker.close();
        await pdfWorker.close();
        await webhookWorker.close();
        logger.info('✅ BullMQ workers closed');

        logger.info('✅ Graceful shutdown complete');
        process.exit(0);

      } catch (error) {
        logger.error(`❌ Shutdown error: ${error.message}`);
        process.exit(1);
      }
    });

    // Timeout — force exit
    setTimeout(() => {
      logger.error(`❌ Shutdown timeout — force exit`);
      process.exit(1);
    }, timeout);
  };

  // Signals register karo
  signals.forEach(signal => {
    process.on(signal, () => shutdown(signal));
  });

  // Unhandled errors
  process.on('uncaughtException', (error) => {
    logger.error(`❌ Uncaught Exception: ${error.message}`);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`❌ Unhandled Rejection: ${reason}`);
    shutdown('unhandledRejection');
  });
};

module.exports = { gracefulShutdown };