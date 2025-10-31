import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/fraud-db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key',
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || 'default-public-key',
  JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || '3600'),
  REFRESH_TOKEN_EXPIRATION: parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '2592000'),
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TRANSACTION_RISK_THRESHOLD: parseFloat(process.env.TRANSACTION_RISK_THRESHOLD || '0.7'),
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  MICROSOFT_OAUTH_CLIENT_ID: process.env.MICROSOFT_OAUTH_CLIENT_ID || '',
  MICROSOFT_OAUTH_CLIENT_SECRET: process.env.MICROSOFT_OAUTH_CLIENT_SECRET || '',
};
