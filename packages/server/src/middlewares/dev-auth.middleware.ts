import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config';

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
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        picture: 'https://via.placeholder.com/150',
        providerId: 'mock-provider-id',
        provider: 'google',
      },
      token: 'dev-jwt-token',
    });
  }

  // For other protected routes, just add a mock user to the request
  req.user = {
    id: 'dev-user-id',
    email: 'dev@example.com',
    name: 'Development User',
    picture: 'https://via.placeholder.com/150',
    providerId: 'mock-provider-id',
    provider: 'google',
  };
  
  next();
};