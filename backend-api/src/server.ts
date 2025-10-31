import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from '@/app';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // WebSocket setup
    const io = new SocketIOServer(server, {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // WebSocket middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      // Verify token here if needed
      next();
    });

    // WebSocket connection handler
    io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        logger.error(`Socket error: ${error}`);
      });
    });

    // Store io instance for global access
    (app as any).io = io;

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`Server started on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
