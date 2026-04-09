const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.get('/summary', authMiddleware, getSummary);

module.exports = router;
