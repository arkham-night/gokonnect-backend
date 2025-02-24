import { Document } from 'mongoose';
import { PaymentStatus, BaseDocument } from '../types/common.types';

export interface IPayment extends BaseDocument {
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: 'PENDING' | 'PROCESSED' | 'FAILED';
}

export interface IPaymentDocument extends IPayment, Document {
  initiateRefund(amount: number): Promise<void>;
}