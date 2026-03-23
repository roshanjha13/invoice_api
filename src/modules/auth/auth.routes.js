const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware')
const { 
    registerValidation, 
    loginValidation, 
    refreshTokenValidation
} = require('./auth.validation');

const { 
    authLimiter, 
    apiKeyRegenerateLimiter 
} = require('../../middlewares/rateLimiter')

const {
    register,
    login,
    getApiKey,
    regenerateApiKey,
    refreshToken,
    logout,
    googleAuth,
    googleCallback
} = require('./auth.controller');

router.post('/register', authLimiter, validate(registerValidation), register)
router.post('/login', authLimiter, validate(loginValidation), login)
router.post('/refresh-token', validate(refreshTokenValidation) , refreshToken);
router.post('/logout', protect, logout);
router.get('/api-key', protect, getApiKey)
router.post('/api-key/regenerate', protect, apiKeyRegenerateLimiter, regenerateApiKey)
router.get('/google', protect, googleAuth)
router.get('/google/callback', protect, googleCallback)

module.exports = router;