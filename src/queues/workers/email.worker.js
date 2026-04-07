const { Worker } = require('bullmq');
const { sendInvoiceEmail } = require('../../utils/emailService');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const { withRetry } = require('../../utils/retryHandler');
const logger = require('../../utils/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const emailWorker = new Worker('email', async (job) => {
  const { invoice } = job.data;
  logger.info(`📧 Processing email job: ${job.id} for ${invoice.clientEmail}`);

  await withRetry(
    async () => {
      const pdfStream = generateInvoicePDF(invoice);
      await sendInvoiceEmail(invoice, pdfStream);
    },
    {
      retries:    3,
      delay:      2000,
      multiplier: 2,
      onRetry: (error, attempt) => {
        logger.warn(`📧 Email retry attempt ${attempt}: ${error.message}`);
      }
    }
  );

  logger.info(`✅ Email sent successfully: ${invoice.invoiceNo}`);

}, { connection });

emailWorker.on('completed', (job) => {
  logger.info(`✅ Email job completed: ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`❌ Email job failed: ${job.id} → ${err.message}`);
});

module.exports = emailWorker;