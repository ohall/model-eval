import OpenAI from 'openai';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { OPENAI_API_KEY } from '../config';
import logger from '../utils/logger';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  async generateResponse(
    prompt: string,
    options: Partial<EvaluationOptions>
  ): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();
    logger.info({ model: options.model || 'gpt-3.5-turbo' }, 'Using OpenAI model');

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
      });

      const endTime = Date.now();
      const latencyMs = endTime - startTime;

      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;

      // Calculate approximate cost based on OpenAI's pricing
      // This is a simplified calculation and may not be accurate for all models
      let costUsd = 0;
      if (options.model?.includes('gpt-4')) {
        costUsd = promptTokens * 0.00003 + completionTokens * 0.00006;
      } else if (options.model?.includes('gpt-3.5')) {
        costUsd = promptTokens * 0.0000015 + completionTokens * 0.000002;
      }

      const metrics: EvaluationMetrics = {
        latencyMs,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
      };

      return {
        response: response.choices[0]?.message.content || '',
        metrics,
      };
    } catch (error: any) {
      logger.error({ error }, 'Error using OpenAI model');

      // Check for quota limit error
      if (
        error?.error?.code === 'insufficient_quota' ||
        (error?.status === 429 && error?.error?.type === 'insufficient_quota')
      ) {
        throw new Error(
          'OpenAI quota exceeded. Please check your billing details or try a different provider.'
        );
      }

      // Rate limit errors
      if (error?.status === 429) {
        throw new Error(
          'OpenAI rate limit exceeded. Please try again in a few moments or use a different provider.'
        );
      }

      // Authentication errors
      if (error?.status === 401) {
        throw new Error('OpenAI authentication failed. Please check your API key configuration.');
      }

      // Server errors
      if (error?.status >= 500) {
        throw new Error(
          'OpenAI service is currently experiencing issues. Please try again later or use a different provider.'
        );
      }

      // Default error message
      throw new Error(
        `OpenAI API Error: ${error?.message || error?.error?.message || 'Unknown error'}`
      );
    }
  }
}
