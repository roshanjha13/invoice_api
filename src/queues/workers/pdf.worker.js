const { Worker } = require('bullmq');
const { generateInvoicePDF } = require('../../utils/pdfGenerator');
const logger = require('../../utils/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const pdfWorker = new Worker('pdf', async (job) => {
  const { invoice } = job.data;

  logger.info(`Processing PDF job: ${job.id} for ${invoice.invoiceNo}`);

  const pdfStream = await generateInvoicePDF(invoice);

  logger.info(`PDF generated successfully: ${invoice.invoiceNo}`);

  return { invoiceNo: invoice.invoiceNo };
}, { connection });

pdfWorker.on('completed', (job) => {
  logger.info(`PDF job completed: ${job.id}`);
});

pdfWorker.on('failed', (job, err) => {
  logger.error(`PDF job failed: ${job.id} → ${err.message}`);
});

module.exports = pdfWorker;