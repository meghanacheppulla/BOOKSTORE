const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

// Verifies JWT and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return error(res, 401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 401, 'Not authorized, user no longer exists');
    }
    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Not authorized, token invalid or expired');
  }
});

// Restrict route to specific roles, e.g. authorize('admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return error(res, 403, `Access denied: requires role(s): ${roles.join(', ')}`);
  }
  next();
};

module.exports = { protect, authorize };
