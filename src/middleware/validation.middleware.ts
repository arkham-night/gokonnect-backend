import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/error';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Validation Error', 400, error.errors));
      } else {
        next(error);
      }
    }
  };
};