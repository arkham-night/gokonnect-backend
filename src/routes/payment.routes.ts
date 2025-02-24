import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { UserRole } from '../types/common.types';

const router = Router();

const verifyPaymentSchema = z.object({
  paymentId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

const initiateRefundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive(),
});

router.post(
  '/verify',
  authenticate,
  validate(verifyPaymentSchema),
  PaymentController.verifyPayment
);

router.post(
  '/refund',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(initiateRefundSchema),
  PaymentController.initiateRefund
);

router.post(
  '/webhook',
  PaymentController.webhookHandler
);

export default router;