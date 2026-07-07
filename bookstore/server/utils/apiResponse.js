// Consistent API response envelope used across the whole API.
// Success: { success: true, data, message }
// Error:   { success: false, message, errors }

const success = (res, statusCode, data, message = 'OK') => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, statusCode, message = 'Something went wrong', errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, error };
