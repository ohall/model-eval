import express from 'express';
import { getProviders, getProviderModels } from '../controllers';

const router = express.Router();

router.route('/')
  .get(getProviders);

router.route('/:provider/models')
  .get(getProviderModels);

export default router;
