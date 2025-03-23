import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config';
import { createDevelopmentUser } from '../utils';

/**
 * Development authentication middleware that bypasses actual authentication
 * in development mode. Should NOT be used in production.
 */
export const devAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only use this middleware in development mode
  if (NODE_ENV !== 'development') {
    return next();
  }

  // Check if this is a request to the auth endpoint
  if (req.path === '/auth/google') {
    // Create a mock response
    return res.status(200).json({
      user: createDevelopmentUser(),
      token: 'dev-jwt-token',
    });
  }

  // For other protected routes, just add a mock user to the request
  req.user = createDevelopmentUser();
  
  next();
};