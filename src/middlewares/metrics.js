const {
    httpRequestCounter,
    httpRequestDuration,
    activeConnections,
} = require('../config/prometheus');

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    activeConnections.inc();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;

        httpRequestCounter.inc({
            method: req.method,
            route,
            status: res.statusCode
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route,
                status: res.statusCode
            },
            duration
        )

        activeConnections.dec()
    });

    next();
}

module.exports = metricsMiddleware;