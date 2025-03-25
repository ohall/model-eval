import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models';
import { JWT_SECRET, GOOGLE_CLIENT_ID } from '../config';
import logger from '../utils/logger';

// Create a Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// Google authentication
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  try {
    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400);
      throw new Error('Invalid Google token');
    }

    // Check if user exists or create a new one
    let user = await UserModel.findOne({ email: payload.email });

    if (!user) {
      // Create a new user
      user = await UserModel.create({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        providerId: payload.sub,
        provider: 'google',
      });
    } else {
      // Update existing user information
      user.name = payload.name;
      user.picture = payload.picture;
      user.providerId = payload.sub;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user and token
    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.get('email') || '',
        name: user.get('name') || '',
        picture: user.get('picture') || '',
        providerId: user.get('providerId') || '',
        provider: user.get('provider') as 'google',
      },
      token,
    });
  } catch (error) {
    logger.error({ error }, 'Google auth error');
    res.status(401);
    throw new Error('Invalid Google token');
  }
});

// Validate token
export const validateToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json({
    valid: true,
    user: req.user,
  });
});
