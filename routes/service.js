const express = require('express');
const serviceController = require('../controllers/serviceController');

const router = express.Router();

// Gửi SMS
router.post('/send-sms', serviceController.sendCode);

module.exports = router;
