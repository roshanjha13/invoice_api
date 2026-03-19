const msg = require('../config/constant');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || msg.SERVER_ERROR;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key  
    if (err.code === 11000) {
        statusCode = msg.CONFLICT;
        message = `${Object.keys(err.keyValue)} already exists`
    }

    // Mongoose validation
    if (err.name === 'ValidationError') {
        statusCode = msg.BAD_REQUEST;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    // JWT errors
    if (err.code === 'JsonWebTokenError') {
        statusCode = msg.UNAUTHORIZED;
        message = 'Token expired'
    }    

    if (err.code === 'TokenExpiredError') {
        statusCode = msg.UNAUTHORIZED;
        message = 'Token expired'
    }

    //Log error
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode} : ${message}`);

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });    

};

module.exports = errorHandler;