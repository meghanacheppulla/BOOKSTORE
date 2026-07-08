

const success = (res, statusCode, data, message = 'OK') => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, statusCode, message = 'Something went wrong', errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, error };
