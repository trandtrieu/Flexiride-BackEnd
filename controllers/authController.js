const Customer = require('../models/customer');
const Driver = require('../models/driver');
const jwt = require('jsonwebtoken');

// Tạo token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY || 'defaultSecretKey', 
    { expiresIn: '1h' }
  );
};

// Đăng ký
exports.register = async (req, res) => {
  const { phone, email, password, role } = req.body;

  if (!phone || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (role == 1) {
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
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    try {
      let driver = await Driver.findOne({ phone });
      if (driver) {
        return res.status(400).json({ message: 'Driver already exists' });
      }

      driver = new Driver({ phone, email, password });
      await driver.save();

      const token = generateToken(driver);
      res.status(200).json({ token, user: driver });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (role == 1) {
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
  } else {
    try {
      const driver = await Driver.findOne({ phone });
      if (!driver) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await driver.isValidPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(driver);
      res.status(200).json({ token, user: driver });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
