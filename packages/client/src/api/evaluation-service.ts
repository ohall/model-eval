import { EvaluationResult, Provider, EvaluationSummary } from '@model-eval/shared';
import apiClient from './api-client';

interface EvaluationRequest {
  promptId: string;
  provider: Provider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

interface MultiEvaluationRequest {
  promptId: string;
  providers: Array<{
    provider: Provider;
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }>;
}

export const EvaluationService = {
  // Create a new evaluation
  create: async (request: EvaluationRequest): Promise<EvaluationResult> => {
    const response = await apiClient.post('/evaluations', request);
    return response.data;
  },

  // Get all evaluations
  getAll: async (): Promise<EvaluationResult[]> => {
    const response = await apiClient.get('/evaluations');
    return response.data;
  },

  // Get evaluation by ID
  getById: async (id: string): Promise<EvaluationResult> => {
    const response = await apiClient.get(`/evaluations/${id}`);
    return response.data;
  },

  // Get evaluations by prompt ID
  getByPromptId: async (promptId: string): Promise<EvaluationResult[]> => {
    const response = await apiClient.get(`/evaluations/prompt/${promptId}`);
    return response.data;
  },

  // Get evaluation summary for a prompt
  getPromptSummary: async (promptId: string): Promise<EvaluationSummary> => {
    const response = await apiClient.get(`/evaluations/prompt/${promptId}/summary`);
    return response.data;
  },

  // Run evaluation across multiple models/providers
  evaluateWithMultipleProviders: async (request: MultiEvaluationRequest): Promise<EvaluationResult[]> => {
    const response = await apiClient.post('/evaluations/multi', request);
    return response.data;
  },

  // Delete an evaluation
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/evaluations/${id}`);
  },
};
