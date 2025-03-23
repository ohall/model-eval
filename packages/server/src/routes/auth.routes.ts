import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NODE_ENV } from '../config';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Special development route for token validation
if (NODE_ENV === 'development') {
  router.get('/validate', (req, res) => {
    res.status(200).json({
      valid: true,
      user: {
        id: 'dev-user-id',
        email: 'dev@example.com',
        name: 'Development User',
        picture: 'https://via.placeholder.com/150',
        providerId: 'mock-provider-id',
        provider: 'google',
      },
    });
  });
} else {
  // Production validate token route
  router.get('/validate', authMiddleware, validateToken);
}

export default router;