const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const msg = require('../config/constant');

//1.Global Rate Limiter
exports.globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    handler: (req,res) => { 
        return res.status(msg.TOO_MANY_REQUESTS).json({
            success: false,
            message: msg.RATE_LIMIT_EXCEEDED
        });
    }
});

//2.Auth Rate Limiter
exports.authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    handler: (req,res) => { 
        return res.status(msg.TOO_MANY_REQUESTS).json({
            success: false,
            message: msg.AUTH_RATE_LIMIT_EXCEEDED
        });
    }
});

//3. IP Based Limiter
exports.ipLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    keyGenerator: (req) => ipKeyGenerator(req),
    handler: (req,res) => { 
        return res.status(msg.TOO_MANY_REQUESTS).json({
            success: false,
            message: msg.IP_RATE_LIMIT_EXCEEDED
        });
    }
});

//4. API Key Regenerate Limiter
exports.apiKeyRegenerateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000 ,
    max: 3,
    handler: (req,res) => { 
        return res.status(msg.TOO_MANY_REQUESTS).json({
            success: false,
            message: msg.API_KEY_REGENERATE_LIMIT_EXCEEDED
        });
    }
});

// 5. PDF Generate Limiter
const pdfLimits = {
    free: {
        windowMs: 24 * 60 * 60 * 1000,
        max: 3
    },
    starter: {
        windowMs: 24 * 60 * 60 * 1000,
        max: 14
    },
    pro: {
        windowMs: 24 * 60 * 60 * 1000,
        max: 50
    },
    enterprise: {
        windowMs: 24 * 60 * 60 * 1000,
        max: 100
    }
}

exports.pdfLimiter = (req, res, next) => {
    const plan = req.user?.plan || 'free';
    const config = pdfLimits[plan];

    const limiter = rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        handler: (req,res) => { 
            return res.status(msg.TOO_MANY_REQUESTS).json({
                success: false,
                message: msg.PDF_LIMIT_EXCEEDED
            });
        }
    })

    limiter(req, res, next);
}

//6.Email Send Limiter
exports.emailLimiter  = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 6,
    handler: (req,res) => { 
        return res.status(msg.TOO_MANY_REQUESTS).json({
            success: false,
            message: msg.EMAIL_LIMIT_EXCEEDED
        });
    }
});

// 5. Plan Rate Limiter
const planLimits = {
    free: {
        windowMs: 60 * 1000,
        max: 4
    },
    starter: {
        windowMs: 60 * 1000,
        max: 14
    },
    pro: {
        windowMs: 60 * 1000,
        max: 50
    },
    enterprise: {
        windowMs: 60 * 1000,
        max: 100
    }
}

exports.planLimiter = (req, res, next) => {
    const plan = req.user?.plan || 'free';
    const config = planLimits[plan];

    const limiter = rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        handler: (req,res) => { 
            return res.status(msg.TOO_MANY_REQUESTS).json({
                success: false,
                message: msg.PDF_LIMIT_EXCEEDED
            });
        }
    })

    limiter(req, res, next);
}