import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Provider } from '../../shared/src/index';
import { providerConfigs } from '../config';

// Get available providers and their configs (without API keys)
export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  // Create a sanitized version of the configs (remove API keys)
  const sanitizedConfigs = Object.entries(providerConfigs).reduce((acc, [key, config]) => {
    const { apiKey, ...safeConfig } = config;
    return {
      ...acc,
      [key]: {
        ...safeConfig,
        isConfigured: Boolean(apiKey),
      },
    };
  }, {});

  res.json(sanitizedConfigs);
});

// Get models for a specific provider
export const getProviderModels = asyncHandler(async (req: Request, res: Response) => {
  const { provider } = req.params;

  // Validate provider
  if (!Object.values(Provider).includes(provider as Provider)) {
    res.status(400);
    throw new Error('Invalid provider');
  }

  const config = providerConfigs[provider as Provider];
  if (!config) {
    res.status(404);
    throw new Error('Provider configuration not found');
  }

  // Check if provider is configured
  if (!config.apiKey) {
    res.status(400);
    throw new Error('Provider API key not configured');
  }

  res.json({
    provider,
    models: config.models,
    defaultModel: config.defaultModel,
  });
});
