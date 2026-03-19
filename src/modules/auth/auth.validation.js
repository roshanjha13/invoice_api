const Joi = require('joi');
const msg = require('../../config/constant')

exports.registerValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(45)
        .required()
        .messages({
            'string.min': msg.NAME_MIN,
            'string.max': msg.NAME_MAX,
            'any.required': msg.NAME_REQUIRED
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': msg.EMAIL_INVALID,
            'any.required': msg.EMAIL_REQUIRED
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': msg.PASSWORD_MIN,
            'string.pattern.base':  msg.PASSWORD_PATTERN,
            'any.required': msg.PASSWORD_REQUIRED
        })
});

exports.loginValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': msg.EMAIL_INVALID,
            'any.required': msg.EMAIL_REQUIRED
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': msg.PASSWORD_REQUIRED
        })
    
})

exports.refreshTokenValidation = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': msg.REFRESH_TOKEN_REQUIRED
  }),
});