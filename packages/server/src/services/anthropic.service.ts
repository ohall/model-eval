import Anthropic from 'anthropic';
import { EvaluationMetrics, EvaluationOptions } from '../../shared/src/index';
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

    const response = await this.client.messages.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      top_p: options.topP,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    const promptTokens = response.usage.input_tokens;
    const completionTokens = response.usage.output_tokens;
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
      response: response.content[0]?.text || '',
      metrics,
    };
  }
}
