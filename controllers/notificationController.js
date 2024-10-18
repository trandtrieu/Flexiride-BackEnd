const Notification = require('../models/notification');
const Customer = require('../models/customer');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, description, to } = req.body;

    // Create new notification
    const newNotification = new Notification({
      title,
      description,
      to
    });

    await newNotification.save();

    res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate('to', 'name email');
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Get notifications for a specific customer
exports.getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const notifications = await Notification.find({ to: customerId }).sort({ date: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer notifications', error: error.message });
  }
};

// Update a notification
exports.updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { title, description, to } = req.body;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { title, description, to },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification updated successfully', notification: updatedNotification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// Get notifications within a date range
exports.getNotificationsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const notifications = await Notification.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications by date range', error: error.message });
  }
};

// Mark notification as read for a customer
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId, customerId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.to.includes(customerId)) {
      return res.status(400).json({ message: 'Customer is not a recipient of this notification' });
    }

    if (!notification.readBy) {
      notification.readBy = [];
    }
    if (!notification.readBy.includes(customerId)) {
      notification.readBy.push(customerId);
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};