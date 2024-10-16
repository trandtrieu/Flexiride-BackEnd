const jwt = require('jsonwebtoken');
require('dotenv').config();


// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Tách chuỗi token để lấy phần sau 'Bearer '
  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token format is invalid' });
  }

  const bearerToken = token.split(' ')[1];

  try {
    // Xác thực token với JWT_SECRET từ biến môi trường
    const decoded = jwt.verify(bearerToken, process.env.SECRET_KEY);

    // Thêm thông tin người dùng từ token vào request
    req.user = decoded;

    next();
  } catch (err) {
    console.error(err); // Log lỗi để xem chi tiết

    // Xử lý các lỗi liên quan đến token
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    res.status(401).json({ message: 'Token verification failed' });
  }
};

module.exports = authMiddleware;
