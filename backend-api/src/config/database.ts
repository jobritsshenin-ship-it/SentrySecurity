import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '@/utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection failed:', error);
  }
};
