import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { RegisterUserDto, LoginResponse } from '../types/service.types';
import { AppError } from '../utils/error';
import { config } from '../config';
import { ValidatorHelper } from '../helpers/validator.helper';

export class AuthService {
  public static async register(userData: RegisterUserDto): Promise<LoginResponse> {
    // Validate email format
    if (!ValidatorHelper.isValidEmail(userData.email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password strength
    const passwordValidation = ValidatorHelper.isStrongPassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new AppError('Password is not strong enough', 400, passwordValidation.errors);
    }

    // Validate phone number
    if (!ValidatorHelper.isValidPhone(userData.phone)) {
      throw new AppError('Invalid phone number format', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  public static async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  public static verifyToken(token: string) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}