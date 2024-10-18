const express = require('express');
const reviewController = require('../controllers/reviewController');
const middlewares = require('../middlewares/authMiddleware'); 
const router = express.Router();

// Create a new review (Customer creates a review for a driver)
router.post('/create-review', middlewares, reviewController.createReview);

// Get average rating of a driver
router.get('/:driver_id/average-rate', reviewController.getDriverAverageRate);

// Update a review (Customer updates their review)
router.put('/update-review/:review_id', middlewares, reviewController.updateReview);

// Delete a review (Customer deletes their review)
router.delete('/delete-review/:review_id', middlewares, reviewController.deleteReview);

// Get all reviews of a customer
router.get('/:customer_id/reviews', middlewares, reviewController.getCustomerReviews);

// Get all reviews of a driver sorted by rate in descending order
router.get('/:driver_id/reviews', reviewController.getDriverReviewsSortedByRate);

module.exports = router;
