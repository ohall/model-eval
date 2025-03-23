import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { PORT, CORS_ORIGINS, NODE_ENV } from './config';
import { connectDB, logger, notFound, errorHandler } from './utils';
import routes from './routes';

// Connect to MongoDB
connectDB();

// Verify production build setup
if (NODE_ENV === 'production') {
  const rootDir = process.cwd();
  logger.info(`Working directory: ${rootDir}`);
  
  // Check client build directories
  const clientPaths = [
    path.resolve(rootDir, 'packages/client/dist'),
    path.resolve(rootDir, 'client/dist'),
    path.resolve(rootDir, 'dist'),
    path.resolve(__dirname, '../../client/dist')
  ];
  
  for (const p of clientPaths) {
    if (fs.existsSync(p)) {
      logger.info(`Found client build at: ${p}`);
      try {
        const files = fs.readdirSync(p);
        logger.info(`Client build files: ${files.join(', ')}`);
        
        // Check for index.html specifically
        if (files.includes('index.html')) {
          logger.info(`✓ index.html found`);
        } else {
          logger.warn(`✗ index.html NOT found in ${p}`);
        }
      } catch (err) {
        logger.error(`Error reading client build directory: ${err}`);
      }
    } else {
      logger.warn(`Client build NOT found at: ${p}`);
    }
  }
}

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

// Debug endpoint for Heroku deployment
app.get('/debug', (req, res) => {
  const rootDir = process.cwd();
  const possiblePaths = [
    path.resolve(rootDir, 'packages/client/dist'),
    path.resolve(rootDir, '../client/dist'),
    path.resolve(rootDir, '../../client/dist'),
    path.resolve(rootDir, 'client/dist'),
    path.resolve(__dirname, '../../client/dist')
  ];
  
  const pathExists = possiblePaths.map(p => ({
    path: p,
    exists: fs.existsSync(p),
    files: fs.existsSync(p) ? fs.readdirSync(p).slice(0, 10) : []
  }));
  
  res.json({
    environment: NODE_ENV,
    currentDirectory: rootDir,
    serverDirectory: __dirname,
    possibleClientPaths: pathExists,
    envVars: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? '[REDACTED]' : undefined,
      CORS_ORIGINS: process.env.CORS_ORIGINS
    }
  });
});

// Serve static files from the client build in production
if (NODE_ENV === 'production') {
  // Define the static folder path - first check if client dist exists at expected path
  let staticPath = path.resolve(__dirname, '../../client/dist');
  
  // Fallback paths for Heroku deployment
  if (!fs.existsSync(staticPath)) {
    // Try alternative paths that might exist in Heroku
    const alternatives = [
      path.resolve(process.cwd(), 'packages/client/dist'),
      path.resolve(process.cwd(), '../client/dist'),
      path.resolve(process.cwd(), '../../client/dist'),
      path.resolve(process.cwd(), 'client/dist')
    ];
    
    for (const alt of alternatives) {
      if (fs.existsSync(alt)) {
        staticPath = alt;
        logger.info(`Using static path: ${staticPath}`);
        break;
      }
    }
  }
  
  // Set up static file serving
  app.use(express.static(staticPath));
  
  // Serve index.html for any non-API routes to support client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      logger.error(`index.html not found at ${indexPath}`);
      res.status(404).send('Client build not found. Make sure to build the client before deploying.');
    }
  });
}

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
