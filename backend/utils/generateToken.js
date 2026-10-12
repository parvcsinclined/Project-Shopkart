const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

module.exports = generateTokenAndSetCookie;