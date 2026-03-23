const promClient = require('prom-client');

const collectDefaultMetrics = promoClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new promoClient.Counter({
    name:       'http_requests_total',
    help:       'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promoClient.Histogram({
    name:       'http_requests_duration_seconds',
    help:       'HTTP request number duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets:    [0.1, 0.3, 0.5, 1, 1.5, 2, 5],  
});

const activeConnections = new promoClient.Gauge({
    name:       'active_connections',
    help:       'Number of active connections',
});

const invoiceCounter = new promoClient.Counter({
    name:       'invoices_created_total',
    help:       'Total number of invoices created',
    labelNames: ['currency', 'status']
})

const pdfGenerationDuration = new promoClient.Histogram({
    name:       'pdf_generation_duration_seconds',
    help:       'PDF generation duration in seconds',
    buckets:    [0.1, 0.5, 1, 2, 5],  
});

const emailQueueSize = new promoClient.Gauge({
    name:       'email_queue_size',
    help:       'Number of email in queue',
});

module.exports = {
    promClient,
    httpRequestCounter,
    httpRequestDuration,
    activeConnections,
    invoiceCounter,
    pdfGenerationDuration,
    emailQueueSize
}