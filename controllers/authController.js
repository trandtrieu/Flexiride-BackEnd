const Customer = require('../models/customer');
const Driver = require('../models/driver');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email: email },
    process.env.SECRET_KEY,
    { expiresIn: '1h' }
  );
};

// Customer Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { phone, email, password, role } = req.body;

    if (!phone || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    const customer = new Customer({ phone, email, password });
    await customer.save();

    const token = generateToken(customer._id, customer.email, role);
    return res.status(200).json({ token, user: customer });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Driver Registration
exports.registerDriver = async (req, res) => {
  try {
    const { personalInfo, document, vehicleImages, bankAccount, role } = req.body;

    if (!personalInfo || !document || !vehicleImages || !bankAccount || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingDriver = await Driver.findOne({ 'personalInfo.phoneNumber': personalInfo.phoneNumber });
    if (existingDriver) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    const driver = new Driver({ personalInfo, document, vehicleImages, bankAccount, role });
    await driver.save();

    const token = generateToken(driver._id, driver.personalInfo.email, role);
    return res.status(200).json({ token, user: driver });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Login
exports.login = async (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    let user;
    if (role === '1') { // Customer role
      user = await Customer.findOne({ phone });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } else { // Driver role
      user = await Driver.findOne({ 'personalInfo.phoneNumber': phone });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, role === '1' ? user.email : user.personalInfo.email, role);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get User Information
exports.getInformation = async (req, res) => {
  const { id } = req.user; 
  const { role } = req.body; 

  try {
    let user;
    
    if (role === '1') { // Customer role
      user = await Customer.findById(id).select('-password'); 
    } else { // Driver role
      user = await Driver.findById(id).select('-personalInfo.password'); 
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
