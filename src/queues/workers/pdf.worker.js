const { Worker } = require('bullmq');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const { uploadPDFToCloudinary } = require('../../utils/cloudinaryService');
const { withRetry } = require('../../utils/retryHandler');
const repo = require('../../modules/invoice/invoice.repository');
const logger = require('../../utils/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const pdfWorker = new Worker('pdf', async (job) => {
  const { invoice } = job.data;
  logger.info(`📄 Processing PDF job: ${job.id} for ${invoice.invoiceNo}`);

  const pdfUrl = await withRetry(
    async () => {
      const pdfStream = await generateInvoicePDF(invoice);
      return uploadPDFToCloudinary(pdfStream, invoice.invoiceNo);
    },
    {
      retries:    3,
      delay:      2000,
      multiplier: 2,
      maxDelay:   15000,
      onRetry: (error, attempt) => {
        logger.warn(`📄 PDF retry attempt ${attempt}: ${error.message}`);
      }
    }
  );

  await repo.updateById(invoice._id, invoice.userId, { pdfUrl });

  logger.info(`✅ PDF generated successfully: ${invoice.invoiceNo}`);

  return { invoiceNo: invoice.invoiceNo, pdfUrl };

}, { connection });

pdfWorker.on('completed', (job) => {
  logger.info(`✅ PDF job completed: ${job.id}`);
});

pdfWorker.on('failed', (job, err) => {
  logger.error(`❌ PDF job failed: ${job.id} → ${err.message}`);
});

module.exports = pdfWorker;