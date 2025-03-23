import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config';
import { UserModel } from '../models';

// Create a Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find or create user
    let user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      user = await UserModel.create({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        providerId: payload.sub,
        provider: 'google',
      });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};