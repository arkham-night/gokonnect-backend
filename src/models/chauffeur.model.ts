import mongoose, { Schema } from 'mongoose';
import { IChauffeurDocument } from '../interfaces/chauffeur.interface';

const chauffeurSchema = new Schema<IChauffeurDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  licenseExpiry: {
    type: Date,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalTrips: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  documents: {
    license: String,
    insurance: String,
    background_check: String,
  },
}, {
  timestamps: true,
});

// Create geospatial index
chauffeurSchema.index({ currentLocation: '2dsphere' });

chauffeurSchema.methods.updateLocation = async function(longitude: number, latitude: number): Promise<void> {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  await this.save();
};

chauffeurSchema.methods.calculateRating = async function(newRating: number): Promise<number> {
  const totalRatings = this.totalTrips;
  const currentRating = this.rating;
  
  const updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);
  this.rating = Number(updatedRating.toFixed(2));
  return this.rating;
};

export const Chauffeur = mongoose.model<IChauffeurDocument>('Chauffeur', chauffeurSchema);