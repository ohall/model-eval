import { ProviderConfig } from '@model-eval/shared';
import apiClient from './api-client';

interface ProviderInfo {
  provider: string;
  models: string[];
  defaultModel: string;
}

type ProviderConfigMap = Record<string, Omit<ProviderConfig, 'apiKey'> & { isConfigured: boolean }>;

export const ProviderService = {
  // Get all available providers and their configuration (without API keys)
  getAll: async (): Promise<ProviderConfigMap> => {
    const response = await apiClient.get('/providers');
    return response.data;
  },

  // Get available models for a specific provider
  getModels: async (provider: string): Promise<ProviderInfo> => {
    const response = await apiClient.get(`/providers/${provider}/models`);
    return response.data;
  },
};
