const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac');
const { getMyLogs, getALLLogs } = require('./audit.controller');

router.use(protect);

router.get('/my-logs',                 getMyLogs);
router.get('/all', authorize('admin'), getALLLogs);

module.exports = router;