import { Provider } from './provider';

/**
 * Represents a prompt to be evaluated
 */
export interface Prompt {
  id?: string; // MongoDB ObjectId
  title: string;
  content: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Options for evaluating a prompt
 */
export interface EvaluationOptions {
  provider: Provider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}