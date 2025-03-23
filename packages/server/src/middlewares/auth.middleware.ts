import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NODE_ENV, JWT_SECRET } from '../config';
import { UserModel } from '../models';
import { isDevelopmentToken, createDevelopmentUser } from '../utils';

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

    // Only allow development tokens on localhost (development mode)
    // or on herokuapp.com when a special header is provided
    if (isDevelopmentToken(token)) {
      // Check if running in development mode
      if (NODE_ENV === 'development') {
        console.log('Development token accepted in development mode');
        req.user = createDevelopmentUser();
        return next();
      }
      
      // Check for special debug header (for Heroku testing only)
      const isDebug = req.headers['x-allow-dev-token'] === 'true';
      
      // Check if the request comes from herokuapp.com domain
      const referer = req.headers.referer || '';
      const isHerokuRequest = referer.includes('herokuapp.com');
      
      if (isDebug && isHerokuRequest) {
        console.log('Development token accepted in production with debug header');
        req.user = createDevelopmentUser();
        return next();
      }
      
      // Otherwise reject the token
      console.warn('Development token rejected in production');
      return res.status(401).json({ message: 'Development tokens not allowed in production' });
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
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};