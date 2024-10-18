const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Danh sách khách hàng nhận thông báo
  to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });  // Thêm createdAt và updatedAt

module.exports = mongoose.model('Notification', NotificationSchema);
