import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { GOOGLE_API_KEY } from '../config';

export class GoogleService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(GOOGLE_API_KEY);
  }

  async generateResponse(prompt: string, options: Partial<EvaluationOptions>): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();

    const model = this.client.getGenerativeModel({
      model: options.model || 'gemini-pro',
    });

    const generationConfig = {
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxTokens,
    };

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    // Google's API doesn't provide token counts directly,
    // so we'll estimate based on characters (rough approximation)
    const promptChars = prompt.length;
    const responseText = response.response.text();
    const completionChars = responseText.length;
    
    // Very rough approximation: ~4 characters per token
    const promptTokens = Math.ceil(promptChars / 4);
    const completionTokens = Math.ceil(completionChars / 4);
    const totalTokens = promptTokens + completionTokens;

    // Approximate cost for Gemini Pro (very simplified)
    const costUsd = (promptTokens * 0.000000125) + (completionTokens * 0.000000375);

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
  }
}
