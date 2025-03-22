import { Provider } from './provider';
import { Prompt } from './prompt';

/**
 * Response metrics from an LLM evaluation
 */
export interface EvaluationMetrics {
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd?: number;
  modelConfidence?: number; // Some providers offer confidence scores
}

/**
 * Represents the result of evaluating a prompt with an LLM
 */
export interface EvaluationResult {
  id?: string; // MongoDB ObjectId
  promptId: string;
  prompt?: Prompt;
  provider: Provider;
  model: string;
  response: string;
  metrics: EvaluationMetrics;
  createdAt?: Date;
}

/**
 * Summary statistics for multiple evaluation results
 */
export interface EvaluationSummary {
  averageLatency: number;
  totalTokens: number;
  averageTokens: number;
  totalCostUsd?: number;
  results: EvaluationResult[];
}