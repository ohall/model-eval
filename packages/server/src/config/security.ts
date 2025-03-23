import { NODE_ENV } from './index';

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Helmet configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://*.googleusercontent.com", "https://*.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.googleapis.com"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.googleusercontent.com", "https://accounts.google.com"],
      imgSrc: ["'self'", "https://*.googleusercontent.com", "data:", "https://*.googleapis.com", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      formAction: ["'self'", "https://accounts.google.com"],
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
  referrerPolicy: { policy: 'no-referrer-when-downgrade' },
  xssFilter: true,
  hidePoweredBy: true
};

// Sensitive endpoint patterns
export const sensitiveEndpoints = [
  /^\/api\/users\/?.*$/,
  /^\/api\/admin\/?.*$/,
  /^\/api\/config\/?.*$/,
  /^\/admin\/?.*$/,
  /^\/\.env$/,
  /^\/\.git\/?.*$/,
  /^\/\.github\/?.*$/,
  /^\/\.vscode\/?.*$/,
  /^\/node_modules\/?.*$/,
  /^\/package\.json$/,
  /^\/package-lock\.json$/,
  /^\/pnpm-lock\.yaml$/,
  /^\/api\/auth\/users\/?.*$/,
  /^\/api\/v1\/users\/?.*$/,
];

// Blocked API paths
export const blockedApiPaths = [
  '/login',  // This should only be handled by SPA routing, not as a direct server route
];

// CORS configuration
export const corsConfig = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}; 