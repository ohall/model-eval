import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationMetrics, EvaluationOptions } from '@model-eval/shared';
import { GOOGLE_API_KEY } from '../config';
import logger from '../utils/logger';

export class GoogleService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(GOOGLE_API_KEY);
  }

  async generateResponse(
    prompt: string,
    options: Partial<EvaluationOptions>
  ): Promise<{ response: string; metrics: EvaluationMetrics }> {
    const startTime = Date.now();

    try {
      // Update model name to handle both formats (with or without version)
      let modelName = options.model || 'gemini-1.5-pro';

      // Try to get available models
      logger.info({ model: modelName }, 'Using Google model');

      const model = this.client.getGenerativeModel({
        model: modelName,
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
      const costUsd = promptTokens * 0.000000125 + completionTokens * 0.000000375;

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
      logger.error({ error }, 'Error using Google Generative AI');

      // Check for quota exceeded error
      if (
        error?.status === 429 ||
        error?.message?.includes('quota') ||
        error?.message?.includes('rate limit')
      ) {
        throw new Error(
          'Google AI quota or rate limit exceeded. Please try again later or use a different provider.'
        );
      }

      // Authentication errors
      if (
        error?.status === 401 ||
        error?.message?.includes('authentication') ||
        error?.message?.includes('API key')
      ) {
        throw new Error(
          'Google AI authentication failed. Please check your API key configuration.'
        );
      }

      // Invalid inputs
      if (error?.status === 400) {
        throw new Error(
          'Invalid request to Google AI. Please check your prompt and configuration.'
        );
      }

      // Server errors
      if (error?.status >= 500) {
        throw new Error(
          'Google AI service is currently experiencing issues. Please try again later or use a different provider.'
        );
      }

      // Default error handling
      throw new Error(`Google API Error: ${error?.message || 'Unknown error'}`);
    }
  }
}
