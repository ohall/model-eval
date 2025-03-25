import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config';
import { createDevelopmentUser } from '../utils';
import logger from '../utils/logger';

/**
 * Development authentication middleware that bypasses actual authentication
 * in development mode. Should NOT be used in production.
 */
export const devAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only use this middleware in development mode
  if (NODE_ENV !== 'development') {
    logger.debug('Development auth middleware skipped in non-development environment');
    return next();
  }

  logger.debug('Development auth middleware active');

  // Check if this is a request to the auth endpoint
  if (req.path === '/api/auth/google') {
    logger.info('Intercepting Google auth request in development mode');
    // Create a mock response
    return res.status(200).json({
      user: createDevelopmentUser(),
      token: 'dev-jwt-token',
    });
  }

  // For other protected routes, just add a mock user to the request
  req.user = createDevelopmentUser();
  logger.debug({ path: req.path }, 'Added development user to request');

  next();
};
