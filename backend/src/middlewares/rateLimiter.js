import rateLimit from 'express-rate-limit';
import config from '../config/config.js';
import ApiResponse from '../utils/apiResponse.js';

const tooManyRequests = (_req, res) =>
  res
    .status(429)
    .json(new ApiResponse(429, 'Too many requests, please try again later.'));

const defaultOptions = {
  windowMs: config.rateLimitWindowMs,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooManyRequests,
};

const globalLimiter = rateLimit({
  ...defaultOptions,
  limit: config.rateLimitMax,
  skip: (req) => req.path === '/api/health',
});

const authLimiter = rateLimit({
  ...defaultOptions,
  limit: config.authRateLimitMax,
});

export { globalLimiter, authLimiter };
export default { globalLimiter, authLimiter };
