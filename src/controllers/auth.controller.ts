import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../types/service.types';
import { catchAsync } from '../utils/catchAsync';

export class AuthController {
  public static register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userData: RegisterUserDto = req.body;
      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    }
  );

  public static login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    }
  );

  public static verifyToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decoded = AuthService.verifyToken(token);
      res.status(200).json({
        success: true,
        data: decoded
      });
    }
  );
}