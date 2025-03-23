import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NODE_ENV } from '../config';
import { createDevelopmentUser, isDevelopmentToken } from '../utils';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Debug route (available in all environments)
router.get('/debug', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || 'none';
  res.status(200).json({
    success: true,
    environment: NODE_ENV,
    authorization: token ? `${token.substring(0, 10)}...` : 'none',
    isDevelopmentToken: token ? isDevelopmentToken(token) : false,
    timestamp: new Date().toISOString()
  });
});

// Special development route for token validation
if (NODE_ENV === 'development') {
  router.get('/validate', (req, res) => {
    res.status(200).json({
      valid: true,
      user: createDevelopmentUser(),
    });
  });
} else {
  // Production validate token route
  router.get('/validate', authMiddleware, validateToken);
}

// Add a test token route for Heroku
router.get('/test-token', (req, res) => {
  const user = createDevelopmentUser();
  
  res.status(200).json({
    message: 'Test authentication successful',
    user,
    token: 'dev-jwt-token',
    help: 'Use this token with Authorization: Bearer dev-jwt-token'
  });
});

export default router;