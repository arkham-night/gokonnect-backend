import { Document } from 'mongoose';
import { UserRole, Address, BaseDocument } from '../types/common.types';

export interface IUser extends BaseDocument {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  address?: Address;
  isVerified: boolean;
  isActive: boolean;
  profilePhoto?: string;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}