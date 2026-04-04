const Joi = require('joi');

exports.createPaymentValidation = Joi.object({
  invoiceId: Joi.string().required().messages({
    'any.required': 'Invoice ID is required'
  }),
});

exports.verifyPaymentValidation = Joi.object({
  razorpayOrderId:   Joi.string().required().messages({
    'any.required': 'Razorpay Order ID is required'
  }),
  razorpayPaymentId: Joi.string().required().messages({
    'any.required': 'Razorpay Payment ID is required'
  }),
  razorpaySignature: Joi.string().required().messages({
    'any.required': 'Razorpay Signature is required'
  }),
});

exports.refundValidation = Joi.object({
  reason: Joi.string().required().messages({
    'any.required': 'Refund reason is required'
  }),
  amount: Joi.number().min(1).optional(),
});