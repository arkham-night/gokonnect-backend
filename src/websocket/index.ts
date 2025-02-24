import { Server, Socket } from 'socket.io';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger';

interface SocketUser {
  userId: string;
  role: string;
}

export class WebSocketService {
  private static io: Server;
  private static userSockets: Map<string, Set<string>> = new Map();

  public static initialize(io: Server) {
    this.io = io;
    this.setupConnectionHandlers();
  }

  private static setupConnectionHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('No authentication token');
        }

        const user = AuthService.verifyToken(token);
        const socketUser: SocketUser = {
          userId: user.id,
          role: user.role,
        };

        socket.data.user = socketUser;
        this.addUserSocket(user.id, socket.id);

        // Handle disconnect
        socket.on('disconnect', () => {
          this.removeUserSocket(user.id, socket.id);
        });

        // Handle location updates for chauffeurs
        if (user.role === 'CHAUFFEUR') {
          socket.on('location:update', (data: { latitude: number; longitude: number }) => {
            this.handleLocationUpdate(socket, data);
          });
        }

        logger.info(`User ${user.id} connected to WebSocket`);
      } catch (error) {
        logger.error('WebSocket connection error:', error);
        socket.disconnect();
      }
    });
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

  private static async handleLocationUpdate(socket: Socket, data: { latitude: number; longitude: number }) {
    try {
      const user = socket.data.user as SocketUser;
      if (user.role !== 'CHAUFFEUR') {
        throw new Error('Only chauffeurs can update location');
      }

      // Update chauffeur location in database
      // Broadcast location update to relevant customers
      this.io.emit(`chauffeur:${user.userId}:location`, data);
    } catch (error) {
      logger.error('Location update error:', error);
    }
  }

  public static notifyNewBooking(chauffeurId: string, booking: any) {
    const sockets = this.userSockets.get(chauffeurId);
    if (sockets) {
      this.io.to([...sockets]).emit('booking:new', booking);
    }
  }

  public static notifyBookingUpdate(userId: string, booking: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      this.io.to([...sockets]).emit('booking:update', booking);
    }
  }
}

export const setupWebSocket = (io: Server) => {
  WebSocketService.initialize(io);
};