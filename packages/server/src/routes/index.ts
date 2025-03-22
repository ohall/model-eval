import express from 'express';
import promptRoutes from './prompt.routes';
import evaluationRoutes from './evaluation.routes';
import providerRoutes from './provider.routes';

const router = express.Router();

router.use('/prompts', promptRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/providers', providerRoutes);

export default router;
