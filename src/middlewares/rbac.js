const { error } = require('../utils/response');
const msg = require('../config/constant');

const authorize = (...roles) => {
    return (req, res, next)=> {
        if (!roles.includes(req.user.role)) {
            return next(error(res, msg.FORBIDDEN, msg.FORBIDDEN_CODE))
        }
        next();
    }
}

const PERMISSIONS = {
  admin: [
    'view:all:users',
    'view:all:invoices',
    'change:plan',
    'ban:user',
    'view:reports',
    'approve:invoice',
  ],
  manager: [
    'view:team:invoices',
    'approve:invoice',
    'view:reports',
  ],
  user: [
    'view:own:invoices',
    'create:invoice',
    'edit:own:invoice',
    'delete:own:invoice',
  ],
};

const hasPermission = (permission) => {
    return (req, res, next) => {
        const userPermissions = PERMISSIONS[req.user.role] || [];
        if(!userPermissions.includes(permission)){
            return next(error(res, msg.FORBIDDEN, msg.FORBIDDEN_CODE));
        }
        next();
    };
};

module.exports = {
    authorize,
    hasPermission,
    PERMISSIONS,
}