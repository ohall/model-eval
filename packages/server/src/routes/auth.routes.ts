import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NODE_ENV } from '../config';
import { createDevelopmentUser } from '../utils';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Token validation route - requires authentication
router.get('/validate', authMiddleware, validateToken);

// Development token endpoint - only available in development mode
if (NODE_ENV === 'development') {
  router.get('/dev-token', (req, res) => {
    const user = createDevelopmentUser();
    res.status(200).json({
      message: 'Development token generated',
      user,
      token: 'dev-jwt-token',
      help: 'Use this token with Authorization: Bearer dev-jwt-token'
    });
  });
}

export default router;