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
      const responseText = response.content[0]?.text || '';

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
    } catch (error) {
      logger.error({ error }, 'Error using Anthropic model');
      throw new Error(`Anthropic API Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }
}
