import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../types/controller.types';
import { catchAsync } from '../utils/catchAsync';

export class PaymentController {
  public static verifyPayment = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

      const payment = await PaymentService.verifyPayment(
        paymentId,
        razorpayPaymentId,
        razorpaySignature
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    }
  );

  public static initiateRefund = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { paymentId, amount } = req.body;

      const refund = await PaymentService.initiateRefund(paymentId, amount);

      res.status(200).json({
        success: true,
        message: 'Refund initiated successfully',
        data: refund
      });
    }
  );

  public static webhookHandler = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Verify webhook signature
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      const crypto = require('crypto');
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      // Handle different webhook events
      const event = req.body.event;
      switch (event) {
        case 'payment.captured':
          // Handle successful payment
          break;
        case 'payment.failed':
          // Handle failed payment
          break;
        case 'refund.processed':
          // Handle successful refund
          break;
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    }
  );
}