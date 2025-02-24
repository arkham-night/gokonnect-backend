export type UUID = string;
export type Timestamp = number;

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CHAUFFEUR = 'CHAUFFEUR',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
}

export interface BaseDocument {
  createdAt: Date;
  updatedAt: Date;
}