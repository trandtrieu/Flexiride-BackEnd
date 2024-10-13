const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Driver Schema
const DriverSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '', unique: true },
  email: { type: String, default: '', unique: true },
  gender: { type: String, default: '' },
  password: { type: String, required: true },
  avatar: {
    type: String,
    default: 'https://api.adorable.io/avatars/285/default.png'
  },
  driver_licence: {
    type: String,
    default: 'https://api.adorable.io/avatars/285/default.png'
  },
  CCCD: {
    type: String,
    default: 'https://api.adorable.io/avatars/285/default.png'
  },
  criminal_record: {
    type: String,
    default: 'https://api.adorable.io/avatars/285/default.png'
  },
  emergency_contact_information: {
    type: String,
    default: ''
  },
  bank_info: {
    type: String,
    default: ''
  },
  vehicle_image: {
    type: String,
    default: 'https://api.adorable.io/avatars/285/default.png'
  },
  vehicle_registration: {
    type: String,
    default: ''
  },
  vehicle_insurance: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: '1',
    enum: ['1', '2', '3']  // Corrected enum values to represent possible roles
  }
});

// Hash password before saving to database
DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Check if password is valid
DriverSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Driver', DriverSchema);