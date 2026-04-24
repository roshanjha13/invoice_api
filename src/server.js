const express = require('express');
const  morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const hpp = require('hpp');
const passport = require('passport');

const swaggerSpec = require('./config/swagger');
const corsConfig = require('./config/cors');
const helmetConfig = require('./config/helmet');
const connectDB = require('./config/db');
const routes = require('./routes/index')
const errorHandler = require('./middlewares/errorHandler');
const xssSanitizer = require('./config/sanitize');
const validateEnv = require('./config/env');
const metricsMiddleware = require('./middlewares/metrics');
const requestTimeout = require('./middlewares/requestTimeout');
require('./config/passport');
require('./config/cloudinary');

const { globalLimiter } = require('./middlewares/rateLimiter');
const { connectRedis } = require('../src/config/redis');
const { promClient } = require('./config/prometheus');
const { startInvoiceResetJob, startTrialExpiryJob } = require('./jobs/invoiceReset.job');
const { 
    emailBreaker, 
    cloudinaryBreaker, 
    razorpayBreaker, 
    webhookBreaker 
} = require('./utils/circuitBreaker');
const { gracefulShutdown } = require('./utils/gracefulShutdown');

require('dotenv').config();

const app = express();

validateEnv();

app.use(helmetConfig);
app.use(compression())
app.use(corsConfig);

app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  next();
});

app.use(xssSanitizer);
app.use(hpp());
app.use(morgan('dev'));
app.use(express.json({ extended: true, limit: '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb'}));
app.use(passport.initialize())
app.use(globalLimiter);
app.use(metricsMiddleware);
app.use(requestTimeout(30000))

app.use('/api/v1',routes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//health check

app.get('/health',(req,res)=>{
    res.json({
        status : 'OK',
        message : 'InvoiceAPI is running' 
    })
})

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

// Circuit breaker stats
app.get('/circuit-breakers', (req, res) => {
  res.json({
    email:      emailBreaker.getStats(),
    cloudinary: cloudinaryBreaker.getStats(),
    razorpay:   razorpayBreaker.getStats(),
    webhook:    webhookBreaker.getStats(),
  });
});

app.use(errorHandler);

require('./queues/workers/email.worker');
require('./queues/workers/pdf.worker');
require('./queues/workers/webhook.worker');

startInvoiceResetJob();
startTrialExpiryJob();

connectDB()
    .then(async ()=>{
        await connectRedis()
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on Port ${process.env.PORT || 3000}`);
        });

        gracefulShutdown(server, { timeout: 30000 });

    })


module.exports = app;