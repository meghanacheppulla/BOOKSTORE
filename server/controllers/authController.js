const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route POST /api/auth/register
// @access All
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return error(res, 409, 'An account with this email already exists');
  }

  // Only ever create 'user' role from public registration.
  // Admins are created via the seed script or promoted directly in the DB.
  const user = await User.create({ name, email, password, role: 'user' });

  const token = signToken(user._id);
  success(res, 201, { user: user.toSafeObject(), token }, 'Registration successful');
});

// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return error(res, 401, 'Invalid email or password');
  }

  const token = signToken(user._id);
  success(res, 200, { user: user.toSafeObject(), token }, 'Login successful');
});

// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  success(res, 200, { user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
