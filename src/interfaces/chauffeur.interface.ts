import { Document } from 'mongoose';
import { BaseDocument } from '../types/common.types';

export interface IChauffeur extends BaseDocument {
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  experience: number;
  rating: number;
  totalTrips: number;
  isAvailable: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  documents: {
    license?: string;
    insurance?: string;
    background_check?: string;
  };
}

export interface IChauffeurDocument extends IChauffeur, Document {
  updateLocation(longitude: number, latitude: number): Promise<void>;
  calculateRating(newRating: number): Promise<number>;
}