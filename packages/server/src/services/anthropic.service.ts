import { Anthropic } from '@anthropic-ai/sdk';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { ANTHROPIC_API_KEY } from '../config';
import logger from '../utils/logger';

export class AnthropicService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(prompt: string, options: Partial<EvaluationOptions>): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();
    const model = options.model || 'claude-3-sonnet-20240229';
    logger.info({ model }, 'Using Anthropic model');

    try {
      const response = await this.client.messages.create({
        model: model,
        max_tokens: options.maxTokens || 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature,
      });

      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      // Get usage metrics from the response
      const promptTokens = response.usage?.input_tokens || 0;
      const completionTokens = response.usage?.output_tokens || 0;
      const totalTokens = promptTokens + completionTokens;
      
      // Get the response text
      const responseText = 
        response.content[0]?.type === 'text' 
          ? response.content[0].text 
          : '';

      // Calculate approximate cost based on Anthropic's pricing
      // This is a simplified calculation and may not be accurate for all models
      let costUsd = 0;
      if (options.model?.includes('claude-3-opus')) {
        costUsd = (promptTokens * 0.00003) + (completionTokens * 0.00015);
      } else if (options.model?.includes('claude-3-sonnet')) {
        costUsd = (promptTokens * 0.000003) + (completionTokens * 0.000015);
      } else if (options.model?.includes('claude-3-haiku')) {
        costUsd = (promptTokens * 0.00000025) + (completionTokens * 0.00000125);
      }

      const metrics: EvaluationMetrics = {
        latencyMs,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
      };

      return {
        response: responseText,
        metrics,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error using Anthropic model');

      // Handle quota/rate limit errors
      if (error?.status === 429 || (error?.error && error?.error?.type === 'rate_limit_error')) {
        throw new Error('Anthropic rate limit or quota exceeded. Please try again later or use a different provider.');
      }
      
      // Authentication errors
      if (error?.status === 401 || (error?.error && error?.error?.type === 'authentication_error')) {
        throw new Error('Anthropic authentication failed. Please check your API key configuration.');
      }

      // Invalid API version (using completions instead of messages)
      if (error?.status === 400 && error?.error?.message?.includes('not supported on this API')) {
        throw new Error('Anthropic API version mismatch. The model requires the Messages API.');
      }
      
      // Server errors
      if (error?.status >= 500) {
        throw new Error('Anthropic service is currently experiencing issues. Please try again later or use a different provider.');
      }
      
      // Default error handling
      throw new Error(`Anthropic API Error: ${error?.message || (error?.error ? JSON.stringify(error.error) : 'Unknown error')}`);
    }
  }
}
