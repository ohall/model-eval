import express from 'express';
import { googleAuth, validateToken } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';
import { NODE_ENV } from '../config';

const router = express.Router();

// Google authentication
router.post('/google', googleAuth);

// Token validation route
router.get('/validate', authMiddleware, validateToken);

export default router;