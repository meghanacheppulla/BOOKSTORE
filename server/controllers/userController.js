const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// @route GET /api/users/profile
// @access Private
const getProfile = asyncHandler(async (req, res) => {
  success(res, 200, { user: req.user.toSafeObject() });
});

// @route PUT /api/users/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return error(res, 404, 'User not found');

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();
  success(res, 200, { user: user.toSafeObject() }, 'Profile updated');
});

// @route GET /api/users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  success(res, 200, { users });
});

module.exports = { getProfile, updateProfile, getAllUsers };
