const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware'); 
const { getDashboardData } = require('../controllers/data.controller');

router.get('/dashboard', authMiddleware, getDashboardData);

module.exports = router;