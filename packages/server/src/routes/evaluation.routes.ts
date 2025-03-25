import express from 'express';
import {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  getEvaluationsByPromptId,
  deleteEvaluation,
  getEvaluationSummaryByPromptId,
  runMultiProviderEvaluation,
} from '../controllers';

const router = express.Router();

router.route('/').get(getEvaluations).post(createEvaluation);

router.route('/multi').post(runMultiProviderEvaluation);

router.route('/:id').get(getEvaluationById).delete(deleteEvaluation);

router.route('/prompt/:promptId').get(getEvaluationsByPromptId);

router.route('/prompt/:promptId/summary').get(getEvaluationSummaryByPromptId);

export default router;
