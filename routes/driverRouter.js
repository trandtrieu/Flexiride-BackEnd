const express = require("express");
const router = express.Router();
const driverController = require('../controllers/driverController');

router.post('/register', driverController.registerDriver);

module.exports = router;