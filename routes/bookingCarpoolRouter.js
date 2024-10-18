const express = require('express');
const bookingCarpoolController = require('../controllers/bookingCarpoolController');
const middlewares = require('../middlewares/authMiddleware'); // Ensure to import the middleware

const router = express.Router();

// Get all available ride sharing requests  // OK
router.get('/available-rides', bookingCarpoolController.availableRides);

// Create new ride sharing request  // OK
router.post('/create-request', middlewares, bookingCarpoolController.createRequest); 

// Join existing ride sharing request   // OK
router.post('/join-request/:requestId', middlewares, bookingCarpoolController.joinRequest);

// Driver accepts ride sharing request     // OK
router.post('/accept-request/:requestId', middlewares, bookingCarpoolController.acceptRequest);

// Cancel participation in a ride sharing request
router.post('/unjoin-request/:requestId', middlewares, bookingCarpoolController.unJoinRequest);

// Get user's ride sharing history  // OK
router.get('/my-rides', middlewares, bookingCarpoolController.myRides);

// Lấy tất cả chuyến xe mà tài xế đã nhận  // OK
router.get('/driver-rides', middlewares, bookingCarpoolController.getDriverRides);

// Cập nhật trạng thái của chuyến xe  // OK
router.put('/driver-rides/:rideId', middlewares, bookingCarpoolController.updateRideStatus);

// Cập nhật tiến trình đón khách    // OK
router.put('/driver-rides/:rideId/pickup/:customerId', middlewares, bookingCarpoolController.updatePickupProgress);


module.exports = router;
