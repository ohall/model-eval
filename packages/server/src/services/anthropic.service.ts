import { Anthropic } from '@anthropic-ai/sdk';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { ANTHROPIC_API_KEY } from '../config';

export class AnthropicService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(prompt: string, options: Partial<EvaluationOptions>): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();

    const response = await this.client.completions.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens_to_sample: options.maxTokens || 1024,
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      temperature: options.temperature,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    // Estimate tokens since the API doesn't provide them directly
    const promptChars = prompt.length;
    const responseText = response.completion;
    const completionChars = responseText.length;
    
    // Very rough approximation: ~4 characters per token
    const promptTokens = Math.ceil(promptChars / 4);
    const completionTokens = Math.ceil(completionChars / 4);
    const totalTokens = promptTokens + completionTokens;

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
      response: response.completion || '',
      metrics,
    };
  }
}
