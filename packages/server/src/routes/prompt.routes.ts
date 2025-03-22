import express from 'express';
import {
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from '../controllers';

const router = express.Router();

router.route('/')
  .get(getPrompts)
  .post(createPrompt);

router.route('/:id')
  .get(getPromptById)
  .put(updatePrompt)
  .delete(deletePrompt);

export default router;
