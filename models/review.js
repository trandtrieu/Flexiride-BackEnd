const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  content: [{
    type: String,
    default: ""
  }],
  rate: {
    type: number,
    default: 1
  }
}, { timestamps: true });  

module.exports = mongoose.model('Review', ReviewSchema);
