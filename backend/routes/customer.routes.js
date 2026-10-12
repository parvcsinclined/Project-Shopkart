const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const {
  register,
  login,
  getProfile,
  logout,
  changePassword,
} = require('../controllers/customer.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);

module.exports = router;