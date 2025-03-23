import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ALLOW_DEV_TOKENS } from '../config';
import { createDevelopmentUser } from '../utils';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Token validation route - requires authentication
router.get('/validate', authMiddleware, validateToken);

// Development token endpoint - only available when ALLOW_DEV_TOKENS is true
if (ALLOW_DEV_TOKENS) {
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