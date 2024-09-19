const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất (cần có token để đăng xuất)
router.get('/logout', authController.logout);

module.exports = router;
