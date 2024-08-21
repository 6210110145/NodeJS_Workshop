const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,                  // limit each IP to 3 requests per 5 min.
    message: 'Too many Input OTP, please try again later.',
    keyGenerator: function (req, res) {
        return req.params.id // Use the OTP ID as the unique key for rate limiting
      },
    handler: function (req, res, next) {
    // Custom handler when limit is reached
        return res.status(429).send({
            message: 'Too many attempts with this OTP, please try again later.',
        });
    }
});

module.exports = limiter