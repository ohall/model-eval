import OpenAI from 'openai';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { OPENAI_API_KEY } from '../config';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt: string, options: Partial<EvaluationOptions>): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();

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
      costUsd = (promptTokens * 0.00003) + (completionTokens * 0.00006);
    } else if (options.model?.includes('gpt-3.5')) {
      costUsd = (promptTokens * 0.0000015) + (completionTokens * 0.000002);
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
  }
}
