import { PaymentStatus } from '../types/common.types';
import crypto from 'crypto';
import { config } from '../config';

export class PaymentHelper {
  // Calculate booking fare
  public static calculateFare(
    distance: number,
    duration: number,
    baseRate: number = 50,
    perKmRate: number = 15,
    perMinuteRate: number = 2
  ): {
    basePrice: number;
    tax: number;
    total: number;
  } {
    const distanceCharge = distance * perKmRate;
    const timeCharge = duration * perMinuteRate;
    const basePrice = baseRate + distanceCharge + timeCharge;
    const tax = basePrice * 0.18; // 18% GST
    const total = basePrice + tax;

    return {
      basePrice: Math.round(basePrice),
      tax: Math.round(tax),
      total: Math.round(total),
    };
  }

  // Verify Razorpay webhook signature
  public static verifyWebhookSignature(
    body: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  }

  // Format currency amount for Razorpay (in paise)
  public static formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  // Generate payment receipt ID
  public static generateReceiptId(bookingId: string): string {
    return `rcpt_${bookingId}_${Date.now()}`;
  }
}