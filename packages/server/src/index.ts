import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import { PORT, CORS_ORIGINS, NODE_ENV } from './config';
import { connectDB, logger, notFound, errorHandler } from './utils';
import { assetRedirectMiddleware, initializeAssetMap } from './utils/asset-handler';
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

// Create a simple static HTML page in case client files are missing
const createFallbackPage = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Model Evaluation Platform</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .error { background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 4px; }
    .api { background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Model Evaluation Platform</h1>
  <div class="error">
    <h2>Client files not found</h2>
    <p>The application is running, but the client build files could not be found. Please check the build process.</p>
  </div>
  <div class="api">
    <h2>API Endpoints</h2>
    <p>The API is still available at the following endpoints:</p>
    <ul>
      <li><a href="/api/providers">/api/providers</a> - Get available model providers</li>
      <li><a href="/health">/health</a> - Check API health</li>
      <li><a href="/debug">/debug</a> - View debug information</li>
    </ul>
  </div>
</body>
</html>`;
};

// Middleware with customized CSP for Google authentication
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://*.googleusercontent.com", "https://*.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.googleapis.com"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.googleusercontent.com"],
      imgSrc: ["'self'", "https://*.googleusercontent.com", "data:", "https://*.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  hidePoweredBy: true,
  strictTransportSecurity: true
}));

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Add request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Add Heroku domain to CORS if not already included
let corsOrigins = CORS_ORIGINS;
if (NODE_ENV === 'production') {
  const herokuUrl = 'https://model-eval-aa67ebbb791b.herokuapp.com';
  if (!corsOrigins.includes(herokuUrl)) {
    corsOrigins = [...corsOrigins, herokuUrl];
    logger.info(`Added Heroku URL to CORS origins: ${herokuUrl}`);
    logger.info(`All CORS origins: ${corsOrigins.join(', ')}`);
  }
}

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Initialize asset mapping for all known files
initializeAssetMap();

// Add asset redirect middleware to handle JS and CSS files
app.use(assetRedirectMiddleware);

// First define health and debug endpoints
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
    path.resolve(rootDir, 'dist'),
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
    routes: app._router.stack.filter((r: any) => r.route).map((r: any) => ({
      path: r.route?.path,
      methods: r.route?.methods
    })),
    middlewareCount: app._router.stack.length,
    envVars: {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? '[REDACTED]' : undefined,
      CORS_ORIGINS: process.env.CORS_ORIGINS
    }
  });
});

// Root route - always available even if other routes fail
app.get('/', (req, res) => {
  // Try multiple potential paths for index.html in order of preference
  const possiblePaths = [
    path.resolve(process.cwd(), 'packages/client/dist/index.html'),
    path.resolve(process.cwd(), 'client/dist/index.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
    path.resolve(__dirname, '../../client/dist/index.html')
  ];
  
  // Try each path until we find one that exists
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      logger.info(`Serving index.html from: ${indexPath}`);
      return res.sendFile(indexPath);
    }
  }
  
  // If no index.html found, log and serve fallback
  logger.warn('No index.html found, serving fallback page');
  
  // Fallback to HTML page
  res.send(createFallbackPage());
});

// Apply dev authentication middleware if in development mode
if (NODE_ENV === 'development') {
  const { devAuthMiddleware } = require('./middlewares/dev-auth.middleware');
  app.use('/api', devAuthMiddleware);
}

// API Routes
app.use('/api', routes);

// Serve static files from the client build in production
if (NODE_ENV === 'production') {
  // Define the static folder path - first check if client dist exists at expected path
  let staticPath = path.resolve(__dirname, '../../client/dist');
  let clientFilesFound = false;
  
  // Fallback paths for Heroku deployment
  if (!fs.existsSync(staticPath)) {
    // Try alternative paths that might exist in Heroku
    const alternatives = [
      path.resolve(process.cwd(), 'packages/client/dist'),
      path.resolve(process.cwd(), '../client/dist'),
      path.resolve(process.cwd(), '../../client/dist'),
      path.resolve(process.cwd(), 'client/dist'),
      path.resolve(process.cwd(), 'dist')
    ];
    
    for (const alt of alternatives) {
      if (fs.existsSync(alt)) {
        const hasIndexHtml = fs.existsSync(path.join(alt, 'index.html'));
        if (hasIndexHtml) {
          staticPath = alt;
          clientFilesFound = true;
          logger.info(`Using static path: ${staticPath}`);
          break;
        } else {
          logger.warn(`Found directory at ${alt} but it doesn't contain index.html`);
        }
      }
    }
  } else {
    clientFilesFound = fs.existsSync(path.join(staticPath, 'index.html'));
    if (!clientFilesFound) {
      logger.warn(`Found directory at ${staticPath} but it doesn't contain index.html`);
    }
  }
  
  if (clientFilesFound) {
    // Set up static file serving
    logger.info(`Serving static files from: ${staticPath}`);
    
    // Set up proper MIME types for common file types
    express.static.mime.define({
      'application/javascript': ['js'],
      'text/css': ['css'],
      'image/svg+xml': ['svg'],
    });

    // Configure static file serving options
    const staticOptions = {
      maxAge: '1d', // Cache for 1 day
      etag: true,
      lastModified: true,
      fallthrough: true, // Continue to next middleware if file not found
      index: false, // Disable auto-serving of index.html for directory requests
      setHeaders: (res: any, path: string) => {
        if (path.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        }
      }
    };
    
    // Serve static files with the configured options
    app.use(express.static(staticPath, staticOptions));
    
    // Special handling for favicon
    app.get('/favicon.svg', (req, res, next) => {
      const possiblePaths = [
        path.join(staticPath, 'favicon.svg'),
        path.join(process.cwd(), 'packages/client/public/favicon.svg'),
        path.join(process.cwd(), 'packages/client/dist/favicon.svg')
      ];
      
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'image/svg+xml');
          return res.sendFile(filePath);
        }
      }
      
      next();
    });
    
    // Special handling for assets folder - try multiple locations
    app.get('/assets/*', (req, res, next) => {
      const assetPath = req.path.substring('/assets/'.length);
      logger.info(`Asset request for: ${assetPath}`);
      
      // Try to find the asset in multiple possible locations
      const possiblePaths = [
        path.join(staticPath, 'assets', assetPath),
        path.join(process.cwd(), 'packages/client/dist/assets', assetPath),
        path.join(process.cwd(), 'client/dist/assets', assetPath),
        path.join(process.cwd(), 'dist/assets', assetPath),
        path.join(__dirname, '../../client/dist/assets', assetPath)
      ];
      
      // Try each path until we find one that exists
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          logger.info(`Serving asset from: ${filePath}`);
          return res.sendFile(filePath);
        }
      }
      
      // If we reach here, the asset was not found in any location
      logger.error(`Asset not found: ${assetPath}. Tried paths: ${possiblePaths.join(', ')}`);
      next();
    });
    
    // Serve index.html for any non-API routes to support client-side routing
    app.get('*', (req, res, next) => {
      // Skip API routes and special paths
      if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/debug' || req.path === '/') {
        return next();
      }
      
      // Log request path for debugging
      logger.info(`Serving index.html for path: ${req.path}`);
      
      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        logger.error(`index.html not found at ${indexPath}`);
        next(); // Let the fallback handler deal with it
      }
    });
  } else {
    // If client files not found, serve a fallback page for all non-API routes
    logger.error('Client build files not found. Serving fallback page.');
    
    app.get('*', (req, res, next) => {
      // Skip API routes and special paths
      if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/debug' || req.path === '/') {
        return next();
      }
      
      res.redirect('/');
    });
  }
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