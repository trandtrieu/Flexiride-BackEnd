const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have middleware to verify tokens

const router = express.Router();

// Register Customer
router.post('/register-customer', authController.registerCustomer);

// Register Driver
router.post('/register-driver', authController.registerDriver);

// Login (for both Customer and Driver based on role)
router.post('/login', authController.login);

// Logout (require token to log out)
router.get('/logout', authMiddleware, authController.logout);

// Get User Information (require token to access user info)
router.get('/get-info', authMiddleware, authController.getInformation);

module.exports = router;
