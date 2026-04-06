const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const {
  getAllTransactions,
  getTransactionStats,
  getMonthlyTransactions,
} = require('./transaction.controller');

router.use(protect);

router.get('/',       getAllTransactions);
router.get('/stats',  getTransactionStats);
router.get('/monthly', getMonthlyTransactions);

module.exports = router;