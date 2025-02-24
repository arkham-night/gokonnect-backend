import { Request } from 'express';
import { AuthTokenPayload } from './service.types';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}