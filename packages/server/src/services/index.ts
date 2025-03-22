import { Provider, EvaluationOptions } from '@model-eval/shared';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GoogleService } from './google.service';

const openaiService = new OpenAIService();
const anthropicService = new AnthropicService();
const googleService = new GoogleService();

export async function generateResponseFromProvider(prompt: string, options: EvaluationOptions) {
  switch (options.provider) {
    case Provider.OPENAI:
      return openaiService.generateResponse(prompt, options);
    case Provider.ANTHROPIC:
      return anthropicService.generateResponse(prompt, options);
    case Provider.GOOGLE:
      return googleService.generateResponse(prompt, options);
    default:
      throw new Error(`Provider not supported: ${options.provider}`);
  }
}

export { OpenAIService, AnthropicService, GoogleService };
