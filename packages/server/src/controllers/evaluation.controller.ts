import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { PromptModel, EvaluationModel } from '../models';
import { generateResponseFromProvider } from '../services';
import { Provider, EvaluationOptions, EvaluationSummary } from '@model-eval/shared';
import mongoose from 'mongoose';

// Create a new evaluation
export const createEvaluation = asyncHandler(async (req: Request, res: Response) => {
  const { promptId, provider, model, temperature, maxTokens, topP } = req.body;

  if (!promptId || !provider || !model) {
    res.status(400);
    throw new Error('Prompt ID, provider, and model are required');
  }

  // Verify the prompt exists
  const prompt = await PromptModel.findById(promptId);
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
  const { response, metrics } = await generateResponseFromProvider(prompt.content, options);

  // Save the evaluation
  const evaluation = await EvaluationModel.create({
    promptId,
    provider,
    model,
    response,
    metrics,
  });

  res.status(201).json(evaluation);
});

// Get all evaluations
export const getEvaluations = asyncHandler(async (req: Request, res: Response) => {
  const evaluations = await EvaluationModel.find()
    .populate('promptId')
    .sort({ createdAt: -1 });
  
  res.json(evaluations);
});

// Get evaluation by ID
export const getEvaluationById = asyncHandler(async (req: Request, res: Response) => {
  const evaluation = await EvaluationModel.findById(req.params.id).populate('promptId');
  
  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }
  
  res.json(evaluation);
});

// Get evaluations by prompt ID
export const getEvaluationsByPromptId = asyncHandler(async (req: Request, res: Response) => {
  const evaluations = await EvaluationModel.find({ promptId: req.params.promptId })
    .populate('promptId')
    .sort({ createdAt: -1 });
  
  res.json(evaluations);
});

// Delete an evaluation
export const deleteEvaluation = asyncHandler(async (req: Request, res: Response) => {
  const evaluation = await EvaluationModel.findById(req.params.id);
  
  if (!evaluation) {
    res.status(404);
    throw new Error('Evaluation not found');
  }
  
  await EvaluationModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Evaluation removed' });
});

// Get evaluation summary statistics by prompt ID
export const getEvaluationSummaryByPromptId = asyncHandler(async (req: Request, res: Response) => {
  const evaluations = await EvaluationModel.find({ promptId: req.params.promptId })
    .populate('promptId')
    .sort({ createdAt: -1 });
  
  if (evaluations.length === 0) {
    res.status(404);
    throw new Error('No evaluations found for this prompt');
  }
  
  const totalLatency = evaluations.reduce((acc, eval) => acc + eval.metrics.latencyMs, 0);
  const totalTokens = evaluations.reduce((acc, eval) => acc + eval.metrics.totalTokens, 0);
  const totalCost = evaluations.reduce((acc, eval) => acc + (eval.metrics.costUsd || 0), 0);
  
  const summary: EvaluationSummary = {
    averageLatency: totalLatency / evaluations.length,
    totalTokens,
    averageTokens: totalTokens / evaluations.length,
    totalCostUsd: totalCost,
    results: evaluations,
  };
  
  res.json(summary);
});

// Run multiple providers on a single prompt
export const runMultiProviderEvaluation = asyncHandler(async (req: Request, res: Response) => {
  const { promptId, providers } = req.body;

  if (!promptId || !providers || !Array.isArray(providers) || providers.length === 0) {
    res.status(400);
    throw new Error('Prompt ID and at least one provider configuration are required');
  }

  // Verify the prompt exists
  const prompt = await PromptModel.findById(promptId);
  if (!prompt) {
    res.status(404);
    throw new Error('Prompt not found');
  }

  // Create a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const evaluationPromises = providers.map(async (providerConfig) => {
      const { provider, model, temperature, maxTokens, topP } = providerConfig;
      
      // Validate provider
      if (!Object.values(Provider).includes(provider as Provider)) {
        throw new Error(`Invalid provider: ${provider}`);
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
      return EvaluationModel.create(
        [
          {
            promptId,
            provider,
            model,
            response,
            metrics,
          },
        ],
        { session }
      );
    });

    // Wait for all evaluations to complete
    const createdEvaluations = await Promise.all(evaluationPromises);
    await session.commitTransaction();

    // Flatten the result array (since create returns an array)
    const evaluations = createdEvaluations.flat();

    res.status(201).json(evaluations);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
