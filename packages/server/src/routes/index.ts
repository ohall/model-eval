import express from 'express';
import promptRoutes from './prompt.routes';
import evaluationRoutes from './evaluation.routes';
import providerRoutes from './provider.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/prompts', authMiddleware, promptRoutes);
router.use('/evaluations', authMiddleware, evaluationRoutes);
router.use('/providers', authMiddleware, providerRoutes);

export default router;
