const repo = require('../modules/audit/audit.repository');
const logger = require('./logger');

const auditLog = async (req, action, module, description, metadata = {}, status = 'success') => {
    try {
        await repo.createLog({
            userId: req.user._id,
            action,
            module,
            description,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata,
            status,
        });
    } catch (error) {
        logger.error(`Audit log error: ${error.message}`);
    }
}


const AUDIT_ACTIONS = {
  // Auth
  LOGIN:              'LOGIN',
  LOGOUT:             'LOGOUT',
  REGISTER:           'REGISTER',
  REGENERATE_API_KEY: 'REGENERATE_API_KEY',

   // Invoice
  CREATE_INVOICE:     'CREATE_INVOICE',
  UPDATE_INVOICE:     'UPDATE_INVOICE',
  DELETE_INVOICE:     'DELETE_INVOICE',
  SEND_INVOICE:       'SEND_INVOICE',
  MARK_PAID:          'MARK_PAID',
  GENERATE_PDF:       'GENERATE_PDF',

  // Admin
  BAN_USER:           'BAN_USER',
  CHANGE_PLAN:        'CHANGE_PLAN',

  CREATE_PAYMENT:     'CREATE_PAYMENT',
  VERIFY_PAYMENT:     'VERIFY_PAYMENT',
  REFUND_PAYMENT:     'REFUND_PAYMENT',
}

const AUDIT_MODULES = {
  AUTH:    'AUTH',
  INVOICE: 'INVOICE',
  ADMIN:   'ADMIN',
  PAYMENT: 'PAYMENT',
};

module.exports = {
    auditLog,
    AUDIT_ACTIONS,
    AUDIT_MODULES
}