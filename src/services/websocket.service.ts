import { Server, Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { logger } from '../utils/logger';

export class WebSocketService {
  private static io: Server;
  private static userSockets: Map<string, Set<string>> = new Map();

  public static initialize(io: Server) {
    this.io = io;
    this.setupConnectionHandlers();
    logger.info('WebSocket service initialized');
  }

  private static setupConnectionHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication token missing');
        }

        const user = await AuthService.verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', this.handleConnection.bind(this));
  }

  private static handleConnection(socket: Socket) {
    const userId = socket.data.user.id;
    this.addUserSocket(userId, socket.id);

    socket.on('disconnect', () => {
      this.removeUserSocket(userId, socket.id);
      logger.info(`User ${userId} disconnected`);
    });

    // Handle real-time location updates for chauffeurs
    if (socket.data.user.role === 'CHAUFFEUR') {
      socket.on('location:update', (data) => {
        this.handleLocationUpdate(socket, data);
      });
    }

    // Handle booking status updates
    socket.on('booking:status', (data) => {
      this.handleBookingStatusUpdate(socket, data);
    });

    logger.info(`User ${userId} connected`);
  }

  private static addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private static removeUserSocket(userId: string, socketId: string) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private static async handleLocationUpdate(socket: Socket, data: any) {
    try {
      const { latitude, longitude } = data;
      const userId = socket.data.user.id;

      // Emit location update to relevant clients
      this.io.emit(`chauffeur:${userId}:location`, { latitude, longitude });
    } catch (error) {
      logger.error('Location update error:', error);
    }
  }

  private static async handleBookingStatusUpdate(socket: Socket, data: any) {
    try {
      const { bookingId, status } = data;
      const userId = socket.data.user.id;

      // Emit booking status update to relevant clients
      this.io.emit(`booking:${bookingId}:status`, { status, updatedBy: userId });
    } catch (error) {
      logger.error('Booking status update error:', error);
    }
  }

  // Public methods for other services to use
  public static notifyNewBooking(chauffeurId: string, bookingData: any) {
    const sockets = this.userSockets.get(chauffeurId);
    if (sockets) {
      this.io.to([...sockets]).emit('booking:new', bookingData);
    }
  }

  public static notifyBookingUpdate(userId: string, bookingData: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      this.io.to([...sockets]).emit('booking:update', bookingData);
    }
  }

  public static notifyPaymentUpdate(userId: string, paymentData: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      this.io.to([...sockets]).emit('payment:update', paymentData);
    }
  }
}