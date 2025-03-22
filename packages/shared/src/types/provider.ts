/**
 * Supported LLM providers
 */
export enum Provider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google'
}

/**
 * Provider-specific model configurations
 */
export interface ProviderConfig {
  provider: Provider;
  apiKey: string;
  models: string[];
  defaultModel: string;
}

/**
 * Map of provider configurations
 */
export type ProviderConfigs = Record<Provider, ProviderConfig>;