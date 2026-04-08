const Joi = require('joi');

exports.createCouponValidation = Joi.object({
  code:        Joi.string().min(3).max(20).required().messages({
    'any.required': 'Coupon code is required',
    'string.min':   'Code must be at least 3 characters',
    'string.max':   'Code must not exceed 20 characters',
  }),
  description: Joi.string().optional(),
  type:        Joi.string().valid('percentage', 'fixed').required().messages({
    'any.required': 'Discount type is required',
    'any.only':     'Type must be percentage or fixed',
  }),
  value:       Joi.number().min(1).required().messages({
    'any.required': 'Discount value is required',
    'number.min':   'Value must be at least 1',
  }),
  maxDiscount: Joi.number().optional(),
  minAmount:   Joi.number().min(0).default(0),
  plans:       Joi.array().items(Joi.string().valid('starter', 'pro', 'enterprise')).default([]),
  usageLimit:  Joi.number().min(1).optional(),
  startDate:   Joi.date().optional(),
  expiryDate:  Joi.date().greater('now').optional(),
});

exports.applyCouponValidation = Joi.object({
  code:   Joi.string().required().messages({
    'any.required': 'Coupon code is required',
  }),
  plan:   Joi.string().valid('starter', 'pro', 'enterprise').required().messages({
    'any.required': 'Plan is required',
  }),
  amount: Joi.number().min(0).required().messages({
    'any.required': 'Amount is required',
  }),
});