const { error } = require('../utils/apiResponse');


const notFound = (req, res, next) => {
  error(res, 404, `Route not found: ${req.originalUrl}`);
};


const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || 'Server error';
  let errors = null;


  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }


  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }


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
