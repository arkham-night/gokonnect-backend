import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthenticatedRequest } from '../types/controller.types';
import { BookingStatus } from '../types/common.types';
import { catchAsync } from '../utils/catchAsync';

export class BookingController {
  public static createBooking = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const customerId = req.user!.id;
      const bookingData = {
        ...req.body,
        customerId
      };

      const result = await BookingService.createBooking(bookingData);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: result
      });
    }
  );

  public static updateBookingStatus = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { bookingId } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      const booking = await BookingService.updateBookingStatus(
        bookingId,
        status as BookingStatus,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking
      });
    }
  );

  public static getBooking = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { bookingId } = req.params;
      const userId = req.user!.id;

      const booking = await BookingService.getBooking(bookingId, userId);

      res.status(200).json({
        success: true,
        data: booking
      });
    }
  );

  public static listBookings = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const role = req.user!.role;

      const bookings = await BookingService.listBookings(userId, role);

      res.status(200).json({
        success: true,
        data: bookings
      });
    }
  );
}