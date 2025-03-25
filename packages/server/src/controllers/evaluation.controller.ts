import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PromptModel, EvaluationModel } from '../models';
import { generateResponseFromProvider } from '../services';
import { Provider, EvaluationOptions, EvaluationSummary } from '@model-eval/shared';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Create a new evaluation for the current user
export const createEvaluation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { promptId, provider, model, temperature, maxTokens, topP } = req.body;

  if (!promptId || !provider || !model) {
    res.status(400);
    throw new Error('Prompt ID, provider, and model are required');
  }

  // Verify the prompt exists and belongs to the current user
  const prompt = await PromptModel.findOne({
    _id: promptId,
    userId: req.user.id,
  });

  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }

  // Validate provider enum
  if (!Object.values(Provider).includes(provider as Provider)) {
    res.status(400);
    throw new Error('Invalid provider');
  }

  const options: EvaluationOptions = {
    provider: provider as Provider,
    model,
    temperature,
    maxTokens,
    topP,
  };

  // Generate the response
  logger.info({ userId: req.user.id, options }, 'Generating response from provider');
  const { response, metrics } = await generateResponseFromProvider(prompt.content, options);

  // Save the evaluation
  logger.info({ userId: req.user.id, metrics }, 'Saving evaluation results');
  const evaluation = await EvaluationModel.create({
    promptId,
    provider,
    model,
    response,
    metrics,
    userId: req.user.id,
  });

  res.status(201).json(evaluation);
});

// Get all evaluations for the current user
export const getEvaluations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const evaluations = await EvaluationModel.find({ userId: req.user.id })
    .populate({
      path: 'promptId',
      match: { userId: req.user.id }, // Only populate prompts that belong to the current user
    })
    .sort({ createdAt: -1 });

  res.json(evaluations);
});

// Get evaluation by ID for the current user
export const getEvaluationById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const evaluation = await EvaluationModel.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).populate({
    path: 'promptId',
    match: { userId: req.user.id }, // Only populate prompts that belong to the current user
  });

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  res.json(evaluation);
});

// Get evaluations by prompt ID for the current user
export const getEvaluationsByPromptId = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // First verify the prompt belongs to the user
  const prompt = await PromptModel.findOne({
    _id: req.params.promptId,
    userId: req.user.id,
  });

  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }

  const evaluations = await EvaluationModel.find({
    promptId: req.params.promptId,
    userId: req.user.id,
  })
    .populate({
      path: 'promptId',
      match: { userId: req.user.id }, // Only populate prompts that belong to the current user
    })
    .sort({ createdAt: -1 });

  res.json(evaluations);
});

// Delete an evaluation for the current user
export const deleteEvaluation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const evaluation = await EvaluationModel.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }

  await EvaluationModel.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Evaluation removed' });
});

// Get evaluation summary statistics by prompt ID for the current user
export const getEvaluationSummaryByPromptId = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // First verify the prompt belongs to the user
  const prompt = await PromptModel.findOne({
    _id: req.params.promptId,
    userId: req.user.id,
  });

  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }

  const evaluations = await EvaluationModel.find({
    promptId: req.params.promptId,
    userId: req.user.id,
  })
    .populate({
      path: 'promptId',
      match: { userId: req.user.id }, // Only populate prompts that belong to the current user
    })
    .sort({ createdAt: -1 });

  if (evaluations.length === 0) {
    res.status(404);
    throw new Error('No evaluations found for this prompt');
  }

  const totalLatency = evaluations.reduce((acc, result) => acc + result.metrics.latencyMs, 0);
  const totalTokens = evaluations.reduce((acc, result) => acc + result.metrics.totalTokens, 0);
  const totalCost = evaluations.reduce((acc, result) => acc + (result.metrics.costUsd || 0), 0);

  const summary: EvaluationSummary = {
    averageLatency: totalLatency / evaluations.length,
    totalTokens,
    averageTokens: totalTokens / evaluations.length,
    totalCostUsd: totalCost,
    results: evaluations,
  };

  res.json(summary);
});

// Run multiple providers on a single prompt for the current user
export const runMultiProviderEvaluation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const { promptId, providers } = req.body;

  if (!promptId || !providers || !Array.isArray(providers) || providers.length === 0) {
    res.status(400);
    throw new Error('Prompt ID and at least one provider configuration are required');
  }

  // Verify the prompt exists and belongs to the current user
  const prompt = await PromptModel.findOne({
    _id: promptId,
    userId: req.user.id,
  });

  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }

  // Create a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // We'll track successful and failed evaluations
    const results: {
      successful: Array<any>;
      failed: Array<{ provider: string; model: string; error: string }>;
    } = {
      successful: [],
      failed: [],
    };

    // Process providers serially to better handle errors
    for (const providerConfig of providers) {
      try {
        const { provider, model, temperature, maxTokens, topP } = providerConfig;

        // Validate provider
        if (!Object.values(Provider).includes(provider as Provider)) {
          results.failed.push({
            provider,
            model,
            error: `Invalid provider: ${provider}`,
          });
          continue;
        }

        const options: EvaluationOptions = {
          provider: provider as Provider,
          model,
          temperature,
          maxTokens,
          topP,
        };

        // Generate the response
        const { response, metrics } = await generateResponseFromProvider(prompt.content, options);

        // Create evaluation document
        const createdEval = await EvaluationModel.create(
          [
            {
              promptId,
              provider,
              model,
              response,
              metrics,
              userId: req.user.id,
            },
          ],
          { session }
        );

        results.successful.push(...createdEval);
      } catch (error: any) {
        // Log the error but continue with other providers
        logger.error(
          {
            userId: req.user.id,
            provider: providerConfig.provider,
            model: providerConfig.model,
            error,
          },
          'Error with provider in multi-evaluation'
        );

        results.failed.push({
          provider: providerConfig.provider,
          model: providerConfig.model,
          error: error.message || 'Unknown error',
        });
      }
    }

    if (results.successful.length > 0) {
      // If at least one evaluation was successful, commit the transaction
      await session.commitTransaction();

      // Return both successful and failed results
      res.status(207).json({
        successful: results.successful,
        failed: results.failed,
      });
    } else {
      // If all evaluations failed, abort the transaction
      await session.abortTransaction();
      res.status(500).json({
        message: 'All evaluations failed',
        errors: results.failed,
      });
    }
  } catch (error) {
    logger.error({ userId: req.user.id, error }, 'Error running multi-provider evaluation');
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
