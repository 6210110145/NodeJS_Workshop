const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,                  // limit each IP to 3 requests per 5 min.
    message: 'Too many Input OTP, please try again later.',
});

module.exports = limiter