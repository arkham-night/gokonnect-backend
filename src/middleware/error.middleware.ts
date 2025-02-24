import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err as any).map(e => e.message),
    });
  }

  // MongoDB duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate Entry',
      errors: [Object.keys((err as any).keyPattern)[0] + ' already exists'],
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};