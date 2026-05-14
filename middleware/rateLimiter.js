const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts – try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,
  message: { success: false, message: 'API rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});
