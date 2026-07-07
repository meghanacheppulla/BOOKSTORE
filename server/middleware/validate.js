const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

// Runs after express-validator check() chains; returns 400 with details if any failed.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const messages = result.array().map((e) => `${e.path}: ${e.msg}`);
    return error(res, 400, 'Validation failed', messages);
  }
  next();
};

module.exports = validate;
