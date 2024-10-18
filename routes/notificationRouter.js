const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Tạo mới 1 notification    // OK
router.post('/', notificationController.createNotification);

// Lấy tất cả notifications    // OK
router.get('/', notificationController.getAllNotifications);

// Lấy tất cả noti ứng với 1 customer    // OK
router.get('/:customerId', notificationController.getCustomerNotifications);

// Update một notification    // OK
router.put('/:notificationId', notificationController.updateNotification);

// Xóa một notification    // OK
router.delete('/:notificationId', notificationController.deleteNotification);

// Lấy danh sách thông báo theo 1 khoảng thời  gian    // OK
router.get('/notifications/daterange', notificationController.getNotificationsByDateRange);

// Đánh dấu thông báo đã đọc    // OK
router.post('/notifications/:notificationId/read/:customerId', notificationController.markNotificationAsRead);

module.exports = router;