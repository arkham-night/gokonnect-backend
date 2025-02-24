import { Document } from 'mongoose';
import { BookingStatus, Coordinates, BaseDocument } from '../types/common.types';

export interface IBooking extends BaseDocument {
  customerId: string;
  chauffeurId: string;
  pickupLocation: {
    address: string;
    coordinates: Coordinates;
  };
  dropLocation: {
    address: string;
    coordinates: Coordinates;
  };
  startTime: Date;
  endTime?: Date;
  status: BookingStatus;
  fare: {
    basePrice: number;
    tax: number;
    total: number;
  };
  paymentId?: string;
  rating?: number;
  feedback?: string;
}

export interface IBookingDocument extends IBooking, Document {
  calculateFare(): Promise<number>;
  updateStatus(status: BookingStatus): Promise<void>;
}