const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');


const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const messages = result.array().map((e) => `${e.path}: ${e.msg}`);
    return error(res, 400, 'Validation failed', messages);
  }
  next();
};

module.exports = validate;
