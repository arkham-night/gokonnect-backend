import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { UserRole, BookingStatus } from '../types/common.types';

const router = Router();

const createBookingSchema = z.object({
  chauffeurId: z.string(),
  pickupLocation: z.object({
    address: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  dropLocation: z.object({
    address: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  startTime: z.string().transform(str => new Date(str)),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(Object.values(BookingStatus) as [string, ...string[]]),
});

router.post(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createBookingSchema),
  BookingController.createBooking
);

router.patch(
  '/:bookingId/status',
  authenticate,
  validate(updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

router.get(
  '/:bookingId',
  authenticate,
  BookingController.getBooking
);

router.get(
  '/',
  authenticate,
  BookingController.listBookings
);

export default router;