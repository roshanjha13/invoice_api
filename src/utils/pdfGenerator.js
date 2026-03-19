const { Worker } = require('worker_threads');
const { PassThrough } = require('stream');
const path = require('path');

// Worker Thread se PDF generate karo
const generateInvoicePDF = (invoice, destination = null) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, '../workers/pdf.thread.js'),
      { workerData: { invoice } }
    );

    worker.on('message', (result) => {
      if (!result.success) {
        return reject(new Error(result.error));
      }

      // Buffer ko stream mein convert karo
      const stream = new PassThrough();
      stream.end(Buffer.from(result.buffer));

      // Agar destination pass kiya toh pipe karo
      if (destination) stream.pipe(destination);

      resolve(stream);
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

module.exports = { generateInvoicePDF };