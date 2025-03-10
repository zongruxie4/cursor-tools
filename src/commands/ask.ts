import type { Command, CommandGenerator, CommandOptions, Provider } from '../types';
import { loadEnv, loadConfig, defaultMaxTokens } from '../config';
import { createProvider } from '../providers/base';
import { ProviderError, ModelNotFoundError } from '../errors';

function getAvailableProviders(): { provider: Provider; available: boolean }[] {
  return [
    { provider: 'perplexity', available: !!process.env.PERPLEXITY_API_KEY },
    { provider: 'gemini', available: !!process.env.GEMINI_API_KEY },
    { provider: 'openai', available: !!process.env.OPENAI_API_KEY },
    { provider: 'anthropic', available: !!process.env.ANTHROPIC_API_KEY },
    { provider: 'openrouter', available: !!process.env.OPENROUTER_API_KEY },
    { provider: 'modelbox', available: !!process.env.MODELBOX_API_KEY },
  ];
}

export class AskCommand implements Command {
  private config;
  constructor() {
    // Load environment variables and configuration.
    loadEnv();
    this.config = loadConfig();
  }

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    // Get available providers
    const availableProviders = getAvailableProviders().filter((p) => p.available);

    // If no providers are available, throw an error
    if (availableProviders.length === 0) {
      throw new ProviderError(
        "No AI providers are currently available. Please run 'cursor-tools install' to set up your API keys."
      );
    }

    // Use provided provider or default to the first available one
    const providerName = options?.provider || availableProviders[0].provider;

    // Check if the requested provider is available
    const providerInfo = getAvailableProviders().find((p) => p.provider === providerName);
    if (!providerInfo) {
      throw new ProviderError(
        `Invalid provider: ${providerName}.\n` +
          'Available providers:\n' +
          availableProviders.map((p) => `- ${p.provider}`).join('\n')
      );
    }
    if (!providerInfo.available) {
      throw new ProviderError(
        `The ${providerName} provider is not available. Please set ${providerName.toUpperCase()}_API_KEY in your environment.\n` +
          'Currently available providers:\n' +
          availableProviders.map((p) => `- ${p.provider}`).join('\n')
      );
    }

    // Use provided model or get default model for the provider
    let model = options?.model;
    if (!model) {
      // Default models for each provider
      const defaultModels: Record<Provider, string> = {
        openai: 'gpt-3.5-turbo',
        anthropic: 'claude-3-haiku-20240307',
        gemini: 'gemini-pro',
        perplexity: 'sonar-small-online',
        openrouter: 'openai/gpt-3.5-turbo',
        modelbox: 'openai/gpt-3.5-turbo',
      };

      model = defaultModels[providerName] || 'gpt-3.5-turbo';
      console.log(`No model specified, using default model for ${providerName}: ${model}`);
    }

    // Set maxTokens from provided options or fallback to the default
    const maxTokens = options?.maxTokens || defaultMaxTokens;

    // Create the provider instance
    const provider = createProvider(providerName);
    let answer: string;
    try {
      // Provide a very simple system prompt
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

    // Yield the answer as the result
    yield answer;
  }
}
