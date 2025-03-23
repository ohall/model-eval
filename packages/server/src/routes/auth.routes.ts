import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Token validation route - requires authentication
router.get('/validate', authMiddleware, validateToken);

export default router;