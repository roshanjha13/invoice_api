const { Worker } = require('bullmq');
const logger = require('../../utils/logger');
const http =  require('http')
const https =  require('https')

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const webhookWorker = new Worker('WebHook', async(job) => {
    const { event, data, webhookUrl } = job.data;
    logger.info(`Processing webhook job: ${job.id} -> ${event}`);

    const payload  = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data
    });

    await new Promise((resolve, reject) => {
        const url = new URL(webhookUrl);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length':      Buffer.byteLength(payload),
                'X-InvoiceAPI-Event':  event,
            }
        }

        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve();
            } else {
                reject(new Error(`Webhook failed: ${res.statusCode}`));
            }
        })

        req.on('error', reject);
        req.write(payload);
        req.end();
    })

    logger.info(`✅ Webhook triggered: ${event}`);

}, { connection })

webhookWorker.on('completed', (job)=>{
    logger.info(`WebHook job completed: ${job.id}`);
})

webhookWorker.on('failed', (job,err)=>{
    logger.error(`WebHook job failed: ${job.id} -> ${err.message}`);
})

module.exports = webhookWorker;