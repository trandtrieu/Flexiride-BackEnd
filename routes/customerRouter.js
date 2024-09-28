const express = require('express');
const customerController = require('../controllers/customerController');

const router = express.Router();

// Tìm driver gần nhất
router.post('/find-driver', customerController.findDriver);

module.exports = router;
