import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import { setupWebSocket } from './websocket';
import { errorHandler } from './middleware/error.middleware';
import { configureRoutes } from './routes';
import { config } from './config';
import { logger } from './utils/logger';

class App {
  public app: Application;
  private server: any;
  private io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  private initializeRoutes(): void {
    configureRoutes(this.app);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeWebSocket(): void {
    setupWebSocket(this.io);
  }

  public listen(): void {
    this.server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  }
}

const app = new App();
app.listen();

export default app;