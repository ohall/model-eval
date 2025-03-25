import { EvaluationResult, Provider, EvaluationSummary } from 'shared/index';
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
  evaluateWithMultipleProviders: async (
    request: MultiEvaluationRequest
  ): Promise<{
    successful: EvaluationResult[];
    failed: Array<{ provider: Provider; model: string; error: string }>;
  }> => {
    const response = await apiClient.post('/evaluations/multi', request);

    // Handle both the old API format (just array of results) and new format (with successful/failed)
    if (Array.isArray(response.data)) {
      return {
        successful: response.data,
        failed: [],
      };
    }

    return response.data;
  },

  // Delete an evaluation
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/evaluations/${id}`);
  },
};
