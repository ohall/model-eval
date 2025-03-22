import mongoose from 'mongoose';
import { MONGODB_URI } from '../config';
import logger from './logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    logger.error(`Error connecting to MongoDB: ${message}`);
    logger.warn('Continuing without MongoDB - some features will not work');
    return null;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    logger.error(`Error disconnecting from MongoDB: ${message}`);
  }
};
