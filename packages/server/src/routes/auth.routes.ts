import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NODE_ENV } from '../config';
import { createDevelopmentUser } from '../utils';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

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

export default router;