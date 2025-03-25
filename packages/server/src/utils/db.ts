import mongoose from 'mongoose';
import { MONGODB_URI } from '../config';
import logger from './logger';

export const connectDB = async () => {
  try {
    // Display connection info (hide sensitive parts)
    const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    logger.info(`Connecting to MongoDB: ${maskedUri}`);

    // Add connection options for better reliability
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout for server selection
      socketTimeoutMS: 45000, // How long the socket can be idle
      connectTimeoutMS: 10000, // How long to wait for connection
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }

    // Add more detailed error logging for MongoDB connectivity issues
    logger.error(`Error connecting to MongoDB: ${message}`);

    if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      logger.error('DNS resolution failed - check your connection string hostname');
    } else if (message.includes('Authentication failed')) {
      logger.error('MongoDB authentication failed - check username and password');
    } else if (message.includes('timed out')) {
      logger.error('MongoDB connection timed out - check network/firewall settings');
    } else if (message.includes('whitelist')) {
      logger.error("IP not whitelisted - add your Heroku app's IP to MongoDB Atlas whitelist");
      logger.error('For MongoDB Atlas: Go to Network Access and add 0.0.0.0/0 for testing');
    }

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
