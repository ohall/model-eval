import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { User } from 'shared/index';
import { JWT_SECRET } from '../config';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication in development mode
  if (NODE_ENV === 'development') {
    // If user is already set by another middleware (like devAuthMiddleware), use it
    if (!req.user) {
      // Set a default development user
      req.user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        picture: 'https://via.placeholder.com/150',
        providerId: 'mock-provider-id',
        provider: 'google',
      };
    }
    return next();
  }
  
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    }
    
    // Special handling for development tokens
    if (token === 'dev-jwt-token' || token.startsWith('dev-token-') || token === 'fake-jwt-token-for-demo') {
      req.user = {
        id: 'dev-user-id', 
        email: 'dev@example.com',
        name: 'Development User',
        provider: 'google',
      };
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Find user by ID
    const user = await UserModel.findById(decoded.id).lean();
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};