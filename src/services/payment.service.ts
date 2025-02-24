import Razorpay from 'razorpay';
import { Payment } from '../models/payment.model';
import { PaymentStatus } from '../types/common.types';
import { config } from '../config';
import { AppError } from '../utils/error';

export class PaymentService {
  private static razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });

  public static async createPaymentOrder(
    bookingId: string,
    customerId: string,
    amount: number
  ) {
    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: bookingId,
    });

    const payment = new Payment({
      bookingId,
      customerId,
      amount,
      razorpayOrderId: order.id,
    });

    await payment.save();
    return payment;
  }

  public static async verifyPayment(
    paymentId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Verify signature
    const isValid = this.verifyPaymentSignature(
      payment.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    return payment;
  }

  public static async initiateRefund(paymentId: string, amount: number) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new AppError('Payment is not completed', 400);
    }

    const refund = await this.razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: amount * 100, // Convert to paise
    });

    await payment.initiateRefund(amount);
    return refund;
  }

  private static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const crypto = require('crypto');
    const text = orderId + '|' + paymentId;
    const generated = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(text)
      .digest('hex');
    
    return generated === signature;
  }
}