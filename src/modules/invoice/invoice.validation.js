const Joi = require('joi');
const msg = require('../../config/constant');

const itemValidation = Joi.object({
  description: Joi.string().required().messages({
    'string.base':  msg.ITEM_DESC_REQUIRED,
    'any.required': msg.ITEM_DESC_REQUIRED
  }),
  hsnCode:  Joi.string().optional(),
  quantity: Joi.number().min(1).required().messages({
    'number.base':  msg.ITEM_QTY_REQUIRED,
    'any.required': msg.ITEM_QTY_REQUIRED
  }),
  rate: Joi.number().min(0).required().messages({
    'number.base':  msg.ITEM_RATE_REQUIRED,
    'any.required': msg.ITEM_RATE_REQUIRED
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base':  msg.ITEM_AMOUNT_REQUIRED,
    'any.required': msg.ITEM_AMOUNT_REQUIRED
  }),
});

exports.createInvoiceValidation = Joi.object({
  clientName: Joi.string().required().messages({
    'string.base':  msg.CLIENT_NAME_REQUIRED,
    'any.required': msg.CLIENT_NAME_REQUIRED
  }),
  clientEmail: Joi.string().email().required().messages({
    'string.email': msg.CLIENT_EMAIL_INVALID,
    'any.required': msg.CLIENT_EMAIL_REQUIRED
  }),
  clientAddress: Joi.string().optional(),
  clientState:   Joi.string().required().messages({
    'any.required': 'Client state is required'
  }),
  businessName:  Joi.string().optional(),
  businessEmail: Joi.string().email().optional(),
  sellerState:   Joi.string().required().messages({
    'any.required': 'Seller state is required'
  }),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR').messages({
    'any.only': msg.CURRENCY_INVALID
  }),
  items: Joi.array().items(itemValidation).min(1).required().messages({
    'array.min':    msg.ITEMS_REQUIRED,
    'any.required': msg.ITEMS_REQUIRED
  }),
  discount: Joi.number().min(0).default(0),
  dueDate:  Joi.date().greater('now').optional(),
  notes:    Joi.string().max(500).optional(),
});

exports.updateInvoiceValidation = Joi.object({
  clientName:    Joi.string().optional(),
  clientEmail:   Joi.string().email().optional(),
  clientAddress: Joi.string().optional(),
  clientState:   Joi.string().optional(),
  businessName:  Joi.string().optional(),
  businessEmail: Joi.string().email().optional(),
  sellerState:   Joi.string().optional(),
  currency:      Joi.string().valid('INR', 'USD', 'EUR', 'GBP').optional(),
  items:         Joi.array().items(itemValidation).min(1).optional(),
  discount:      Joi.number().min(0).optional(),
  dueDate:       Joi.date().optional(),
  notes:         Joi.string().max(500).optional(),
  status:        Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
});
