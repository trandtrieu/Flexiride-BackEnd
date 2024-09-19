const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '', unique: true  },
  email: { type: String, default: '', unique: true},
  gender: { type: String, default: '' },
  password: { type: String, required: true }
});

// Hash password trước khi lưu vào database
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Kiểm tra password
CustomerSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Customer', CustomerSchema);
