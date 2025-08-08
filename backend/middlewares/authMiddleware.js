const axios = require('axios');
require('dotenv').config();

const clientId = process.env.LAOID_CLIENT_ID;
const clientSecret = process.env.LAOID_CLIENT_SECRET;

const authMiddleware = async (req, res, next) => {
  const accessToken = req.headers['x-access-token'];
  const userEmail = req.headers['x-user-email'];
  const userPassword = req.headers['x-user-password'];

  if (!accessToken || !userEmail || !userPassword) {
    return res.status(401).json({ message: 'Thiếu accessToken hoặc thông tin đăng nhập mail' });
  }

  try {
    req.user = {
      email: userEmail,
      password: userPassword,
    };
    next();
  } catch (error) {
    console.error("AuthMiddleware error:", error?.response?.data || error.message);
    return res.status(401).json({ message: 'Xác thực token thất bại' });
  }
};

module.exports = authMiddleware;