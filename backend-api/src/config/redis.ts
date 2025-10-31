import redis from 'redis';
import { env } from './env';
import { logger } from '@/utils/logger';

const client = redis.createClient({
  url: env.REDIS_URL,
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('connect', () => {
  logger.info('Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await client.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    process.exit(1);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await client.disconnect();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error('Redis disconnection failed:', error);
  }
};

export default client;
