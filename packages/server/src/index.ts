import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { PORT, CORS_ORIGINS, NODE_ENV } from './config';
import { connectDB, logger, notFound, errorHandler } from './utils';
import routes from './routes';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
}));
app.use(express.json());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Apply dev authentication middleware if in development mode
if (NODE_ENV === 'development') {
  const { devAuthMiddleware } = require('./middlewares/dev-auth.middleware');
  app.use('/api', devAuthMiddleware);
}

// API Routes
app.use('/api', routes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Ensure we have the updated port from config
const port = parseInt(process.env.PORT || '8001', 10);

// Start server
const server = app.listen(port, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;
