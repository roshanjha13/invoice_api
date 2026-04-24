const promClient = require('prom-client');

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestCounter = new promClient.Counter({
    name:       'http_requests_total',
    help:       'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
    name:       'http_requests_duration_seconds',
    help:       'HTTP request number duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets:    [0.1, 0.3, 0.5, 1, 1.5, 2, 5],  
});

const activeConnections = new promClient.Gauge({
    name:       'active_connections',
    help:       'Number of active connections',
});

const invoiceCounter = new promClient.Counter({
    name:       'invoices_created_total',
    help:       'Total number of invoices created',
    labelNames: ['currency', 'status']
})

const pdfGenerationDuration = new promClient.Histogram({
    name:       'pdf_generation_duration_seconds',
    help:       'PDF generation duration in seconds',
    buckets:    [0.1, 0.5, 1, 2, 5],  
});

const emailQueueSize = new promClient.Gauge({
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