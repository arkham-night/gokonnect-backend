import mongoose, { Schema } from 'mongoose';
import { IBookingDocument } from '../interfaces/booking.interface';
import { BookingStatus } from '../types/common.types';

const bookingSchema = new Schema<IBookingDocument>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chauffeurId: {
    type: Schema.Types.ObjectId,
    ref: 'Chauffeur',
    required: true,
  },
  pickupLocation: {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  dropLocation: {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  status: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  },
  fare: {
    basePrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
}, {
  timestamps: true,
});

bookingSchema.methods.calculateFare = async function(): Promise<number> {
  // Basic fare calculation logic - can be enhanced based on requirements
  const basePrice = 500; // Base price for booking
  const tax = basePrice * 0.18; // 18% tax
  const total = basePrice + tax;

  this.fare = {
    basePrice,
    tax,
    total,
  };

  return total;
};

bookingSchema.methods.updateStatus = async function(status: BookingStatus): Promise<void> {
  this.status = status;
  if (status === BookingStatus.COMPLETED) {
    this.endTime = new Date();
  }
  await this.save();
};

export const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema);