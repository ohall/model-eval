import dotenv from 'dotenv';
import { Provider, ProviderConfigs } from '../../shared/src/index';

dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 8000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/model-eval';
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

// Provider API keys
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

// Provider configurations
export const providerConfigs: ProviderConfigs = {
  [Provider.OPENAI]: {
    provider: Provider.OPENAI,
    apiKey: OPENAI_API_KEY,
    models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-3.5-turbo',
  },
  [Provider.ANTHROPIC]: {
    provider: Provider.ANTHROPIC,
    apiKey: ANTHROPIC_API_KEY,
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-sonnet-20240229',
  },
  [Provider.GOOGLE]: {
    provider: Provider.GOOGLE,
    apiKey: GOOGLE_API_KEY,
    models: ['gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-pro',
  },
};