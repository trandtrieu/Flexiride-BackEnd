const Customer = require('../models/customer');
const jwt = require('jsonwebtoken');

// Tạo token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, 'yourSecretKey', { expiresIn: '1h' });
};

// Đăng ký
exports.register = async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    let customer = await Customer.findOne({ phone });
    if (customer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    customer = new Customer({ phone, email, password });
    await customer.save();

    const token = generateToken(customer);
    res.status(200).json({ token, user: customer });
  } catch (err) {
    res.status(500).json({ message: err});
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await customer.isValidPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(customer);
    res.status(200).json({ token, user: customer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
