const Review = require('../models/review'); 
const Driver = require('../models/driver'); 

// Create a new review for a driver
exports.createReview = async (req, res) => {
  try {
    const { account_id, driver_id, content, rate } = req.body;

    // Create new review
    const newReview = new Review({
      account_id,
      driver_id,
      content,
      rate
    });

    await newReview.save();

    res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};

// Get average rate for a driver
exports.getDriverAverageRate = async (req, res) => {
  try {
    const { driver_id } = req.params;

    // Aggregate reviews to calculate the average rate
    const avgRate = await Review.aggregate([
      { $match: { driver_id: mongoose.Types.ObjectId(driver_id) } },
      { $group: { _id: '$driver_id', averageRate: { $avg: '$rate' } } }
    ]);

    res.status(200).json({ averageRate: avgRate.length > 0 ? avgRate[0].averageRate : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching average rate', error });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { content, rate } = req.body;

    // Find and update review
    const updatedReview = await Review.findOneAndUpdate(
      { _id: review_id, account_id: req.user._id }, // Ensure the customer can only update their own review
      { content, rate },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;

    // Find and delete review
    const deletedReview = await Review.findOneAndDelete({
      _id: review_id,
      account_id: req.user._id // Ensure the customer can only delete their own review
    });

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};

// Get all reviews of a customer
exports.getCustomerReviews = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Find all reviews by the customer
    const customerReviews = await Review.find({ account_id: customer_id }).populate('driver_id');

    res.status(200).json({ reviews: customerReviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer reviews', error });
  }
};

// Get all reviews of a driver sorted by rate in descending order
exports.getDriverReviewsSortedByRate = async (req, res) => {
  try {
    const { driver_id } = req.params;

    // Find all reviews for the driver, sorted by rate in descending order
    const driverReviews = await Review.find({ driver_id }).sort({ rate: -1 }).populate('account_id');

    res.status(200).json({ reviews: driverReviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver reviews', error });
  }
};
