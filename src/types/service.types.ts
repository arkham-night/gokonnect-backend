import { UserRole } from './common.types';

export interface AuthTokenPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface CreateBookingDto {
  customerId: string;
  chauffeurId: string;
  pickupLocation: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  dropLocation: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  startTime: Date;
}