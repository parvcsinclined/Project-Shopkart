const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateTokenAndSetCookie = require('../utils/generateToken');

// Task 1: Register Customer
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 2: Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateTokenAndSetCookie(res, customer._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Task 3: My Profile
exports.getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// Task 4: Logout
exports.logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Bonus Challenge: Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const customer = await Customer.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, customer.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};