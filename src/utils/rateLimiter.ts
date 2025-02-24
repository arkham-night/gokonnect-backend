import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // limit each IP to 100 requests per windowMs
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    skip: () => config.env === 'development',
  });
};

// Specific limiters for different routes
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiLimiter = createRateLimiter(60 * 1000, 60); // 60 requests per minute