import { Booking } from '../models/booking.model';
import { Chauffeur } from '../models/chauffeur.model';
import { User } from '../models/user.model';
import { BookingStatus } from '../types/common.types';
import { CreateBookingDto } from '../types/service.types';
import { AppError } from '../utils/error';
import { PaymentService } from './payment.service';
import { WebSocketService } from './websocket.service';

export class BookingService {
  public static async createBooking(bookingData: CreateBookingDto) {
    // Validate chauffeur availability
    const chauffeur = await Chauffeur.findById(bookingData.chauffeurId);
    if (!chauffeur || !chauffeur.isAvailable) {
      throw new AppError('Chauffeur is not available', 400);
    }

    // Create booking
    const booking = new Booking(bookingData);
    await booking.calculateFare();
    await booking.save();

    // Create payment
    const payment = await PaymentService.createPaymentOrder(
      booking._id,
      bookingData.customerId,
      booking.fare.total
    );

    // Update booking with payment
    booking.paymentId = payment._id;
    await booking.save();

    // Notify chauffeur via WebSocket
    WebSocketService.notifyNewBooking(bookingData.chauffeurId, booking);

    return { booking, payment };
  }

  public static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId: string
  ) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Validate state transition
    if (!this.isValidStatusTransition(booking.status, status)) {
      throw new AppError('Invalid status transition', 400);
    }

    // Update booking status
    await booking.updateStatus(status);

    // Handle status-specific actions
    switch (status) {
      case BookingStatus.CONFIRMED:
        await this.handleBookingConfirmation(booking);
        break;
      case BookingStatus.COMPLETED:
        await this.handleBookingCompletion(booking);
        break;
    }

    // Notify relevant parties
    await this.notifyBookingUpdate(booking);

    return booking;
  }

  public static async getBooking(bookingId: string, userId: string) {
    const booking = await Booking.findById(bookingId)
      .populate('customerId', '-password')
      .populate('chauffeurId')
      .populate('paymentId');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Ensure user has access to this booking
    if (
      booking.customerId.toString() !== userId &&
      booking.chauffeurId.toString() !== userId
    ) {
      throw new AppError('Unauthorized access to booking', 403);
    }

    return booking;
  }

  public static async listBookings(userId: string, role: string) {
    let filter: any = {};

    if (role === 'CUSTOMER') {
      filter.customerId = userId;
    } else if (role === 'CHAUFFEUR') {
      filter.chauffeurId = userId;
    }

    return Booking.find(filter)
      .populate('customerId', '-password')
      .populate('chauffeurId')
      .populate('paymentId')
      .sort({ createdAt: -1 });
  }

  private static isValidStatusTransition(
    currentStatus: BookingStatus,
    newStatus: BookingStatus
  ): boolean {
    const validTransitions = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus].includes(newStatus);
  }

  private static async handleBookingConfirmation(booking: any) {
    const chauffeur = await Chauffeur.findById(booking.chauffeurId);
    if (chauffeur) {
      chauffeur.isAvailable = false;
      await chauffeur.save();
    }
  }

  private static async handleBookingCompletion(booking: any) {
    const chauffeur = await Chauffeur.findById(booking.chauffeurId);
    if (chauffeur) {
      chauffeur.isAvailable = true;
      chauffeur.totalTrips += 1;
      await chauffeur.save();
    }
  }

  private static async notifyBookingUpdate(booking: any) {
    WebSocketService.notifyBookingUpdate(booking.customerId, booking);
    WebSocketService.notifyBookingUpdate(booking.chauffeurId, booking);
  }
}