const { body } = require('express-validator');

module.exports = [
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .isLength({ min: 4 }).withMessage('Password must be at least 4 characters')
    .isLength({ max: 10}).withMessage('Password must not be more than 10 characters')
]