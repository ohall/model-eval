import { Prompt } from '@model-eval/shared';
import apiClient from './api-client';

export const PromptService = {
  // Get all prompts
  getAll: async (): Promise<Prompt[]> => {
    const response = await apiClient.get('/prompts');
    return response.data;
  },

  // Get prompt by ID
  getById: async (id: string): Promise<Prompt> => {
    const response = await apiClient.get(`/prompts/${id}`);
    return response.data;
  },

  // Create a new prompt
  create: async (prompt: Omit<Prompt, 'id'>): Promise<Prompt> => {
    const response = await apiClient.post('/prompts', prompt);
    return response.data;
  },

  // Update a prompt
  update: async (id: string, prompt: Partial<Prompt>): Promise<Prompt> => {
    const response = await apiClient.put(`/prompts/${id}`, prompt);
    return response.data;
  },

  // Delete a prompt
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/prompts/${id}`);
  },
};
