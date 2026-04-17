import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eduboard',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
