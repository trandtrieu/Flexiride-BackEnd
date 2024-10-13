const mongoose = require('mongoose');

const BookingCarpoolSchema = new mongoose.Schema({
  // Danh sách khách hàng trong chuyến xe
  account_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  }],
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  start_location: {
    type: String,
    required: true
  },
  end_location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true  // Lưu trữ ngày bắt đầu
  },
  time_start: {
    type: String,  // Lưu giờ xuất phát dưới dạng chuỗi (hh:mm)
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'completed']  // Trạng thái của chuyến đi
  }
}, { timestamps: true });  // Thêm createdAt và updatedAt

module.exports = mongoose.model('Booking_Carpool', BookingCarpoolSchema);
