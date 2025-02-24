import mongoose, { Schema } from 'mongoose';
import { IPaymentDocument } from '../interfaces/payment.interface';
import { PaymentStatus } from '../types/common.types';

const paymentSchema = new Schema<IPaymentDocument>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  refundId: String,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'FAILED'],
  },
}, {
  timestamps: true,
});

paymentSchema.methods.initiateRefund = async function(amount: number): Promise<void> {
  this.refundAmount = amount;
  this.refundStatus = 'PENDING';
  await this.save();
};

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);