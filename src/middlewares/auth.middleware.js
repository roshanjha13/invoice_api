const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const msg = require('../config/constant');
const repo = require('../modules/auth/auth.repository');
const { isTokenBlacklisted } = require('../utils/redisHelper');
const { verifyAccessToken } = require('../utils/generateToken');

exports.protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) return next(error(res, msg.UNAUTHORIZED, msg.UNAUTHORIZED_CODE));

        const blacklisted = await isTokenBlacklisted(token);
        if(blacklisted) return next(error(res, msg.TOKEN_BLACKLISTED, msg.UNAUTHORIZED_CODE));

        const decoded = verifyAccessToken(token);
        req.user = await repo.findById(decoded.id);
        req.token = token;
        next();
    } catch (error) {
        return next(error(res, msg.TOKEN_INVALID, msg.UNAUTHORIZED_CODE));  
    }
}

exports.apiKeyAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if(!apiKey) return next(error(res, msg.API_KEY_REQUIRED,msg.UNAUTHORIZED_CODE));

        const user = await repo.findByApiKey(apiKey);
        if(!user) return next(error(res, msg.API_KEY_INVALID, msg.UNAUTHORIZED_CODE));

        if (user.plan === 'free' && user.invoiceCount >= 3) {
            return next(error(res, msg.PLAN_LIMIT_REACHED, HTTP.FORBIDDEN));
        }

        req.user = user;
        next();
        
    } catch (error) {
        next(error);
    }
}