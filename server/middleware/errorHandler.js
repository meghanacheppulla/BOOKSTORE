const { error } = require('../utils/apiResponse');

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  error(res, 404, `Route not found: ${req.originalUrl}`);
};

// Centralized error handler - catches thrown/next(err) errors
// including Mongoose validation & cast errors.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || 'Server error';
  let errors = null;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field '${field}'`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  error(res, statusCode, message, errors);
};

module.exports = { notFound, errorHandler };
