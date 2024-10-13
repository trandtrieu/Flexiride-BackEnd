const express = require('express');
const bookingCarpoolController = require('../controllers/bookingCarpool');
const middlewares = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all available ride sharing requests  // OK
router.get('/available-rides', bookingCarpoolController.availableRides);

// Create new ride sharing request  // OK
router.post('/create-request', middlewares, bookingCarpoolController.createRequest);

// Join existing ride sharing request   // Ok
router.post('/join-request/:requestId', middlewares, bookingCarpoolController.joinRequest);

// Driver accepts ride sharing request     // Đợi lấy router create driver account rồi test
router.post('/accept-request/:requestId', middlewares, bookingCarpoolController.acceptRequest);

// Get user's ride sharing history
router.get('/my-rides', middlewares, bookingCarpoolController.myRides);

module.exports = router;
