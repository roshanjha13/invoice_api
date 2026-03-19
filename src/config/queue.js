const { Queue } = require('bullmq');
const logger = require('../utils/logger');

const connection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
}

const emailQueue = new Queue('email', { connection });
const pdfQueue = new Queue('pdf', { connection });
const webhookQueue = new Queue('webhook', { connection });
const reminderQueue = new Queue('reminder', { connection });

logger.info('Bullmq queues initialized');

module.exports = {
    emailQueue,
    pdfQueue,
    webhookQueue,
    reminderQueue
}