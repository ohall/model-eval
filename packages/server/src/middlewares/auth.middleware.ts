import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NODE_ENV, JWT_SECRET, ALLOW_DEV_TOKENS } from '../config';
import { UserModel } from '../models';
import { isDevelopmentToken, createDevelopmentUser } from '../utils';
import logger from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        picture?: string;
        provider?: string;
      };
    }
  }
}

/**
 * JWT Authentication middleware that verifies the JWT token 
 * and attaches the user to the request object.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Handle development tokens based on configuration
    if (isDevelopmentToken(token)) {
      if (ALLOW_DEV_TOKENS) {
        logger.debug('Development token accepted (ALLOW_DEV_TOKENS=true)');
        req.user = createDevelopmentUser();
        return next();
      }
      
      logger.warn('Development token rejected (ALLOW_DEV_TOKENS=false)');
      return res.status(401).json({ message: 'Development tokens not allowed' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Find the user by ID
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider
    };

    next();
  } catch (error) {
    // Get token from the Authorization header for logging, but be careful not to log the full token
    const token = req.headers.authorization?.split(' ')[1];
    const tokenPreview = token ? `${token.substring(0, 10)}...` : 'none';
    logger.error({ error, tokenPreview }, 'Auth middleware error');
    res.status(401).json({ message: 'Invalid token' });
  }
};