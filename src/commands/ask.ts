import type { Command, CommandGenerator, CommandOptions } from '../types';
import { loadEnv, loadConfig, defaultMaxTokens } from '../config';
import { createProvider } from '../providers/base';
import { ProviderError, ModelNotFoundError } from '../errors';

export class AskCommand implements Command {
  private config;
  constructor() {
    // Load environment variables and configuration.
    loadEnv();
    this.config = loadConfig();
  }
  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    // Ensure provider was passed, otherwise throw an error.
    const providerName = options?.provider;
    if (!providerName) {
      throw new ProviderError(
        "The 'ask' command requires a provider parameter (e.g. --provider openai)."
      );
    }
    // Ensure model parameter was passed.
    const model = options?.model;
    if (!model) {
      throw new ModelNotFoundError(providerName);
    }
    // Set maxTokens from provided options or fallback to the default.
    const maxTokens = options?.maxTokens || defaultMaxTokens;
    // Create the provider instance.
    const provider = createProvider(providerName);
    let answer: string;
    try {
      // Provide a very simple system prompt.
      answer = await provider.executePrompt(query, {
        model,
        maxTokens,
        debug: options?.debug,
        systemPrompt:
          'You are a helpful assistant. Answer the following question directly and concisely.',
      });
    } catch (error) {
      throw new ProviderError(
        error instanceof Error ? error.message : 'Unknown error during ask command execution',
        error
      );
    }
    // Yield the answer as the result.
    yield answer;
  }
}
