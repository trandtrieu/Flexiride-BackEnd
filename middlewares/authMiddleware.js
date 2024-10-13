const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Tách chuỗi token để lấy phần sau 'Bearer '
  const bearerToken = token.split(' ')[1];

  try {
    // Xác thực token
    const decoded = jwt.verify(bearerToken, 'yourSecretKey');
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (err) {
    console.error(err); // Log lỗi để xem chi tiết
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
