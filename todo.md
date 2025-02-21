# Implementation Plan: Add 'ask' Command

## Overview
Add a new `ask` command endpoint that requires model and provider parameters and a question. The command will use the specified model and provider to answer the question directly.

## Step 1: Create the AskCommand File

Create a new file at `src/commands/ask.ts`:

```typescript
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
      throw new ProviderError("The 'ask' command requires a provider parameter (e.g. --provider openai).");
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
        systemPrompt: "You are a helpful assistant. Answer the following question directly and concisely.",
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
```

## Step 2: Register the Command

Update `src/commands/index.ts`:

```typescript
import type { CommandMap } from '../types';
import { WebCommand } from './web.ts';
import { InstallCommand } from './install.ts';
import { GithubCommand } from './github.ts';
import { BrowserCommand } from './browser/browserCommand.ts';
import { PlanCommand } from './plan.ts';
import { RepoCommand } from './repo.ts';
import { DocCommand } from './doc.ts';
import { AskCommand } from './ask';  // <-- New Import

export const commands: CommandMap = {
  web: new WebCommand(),
  repo: new RepoCommand(),
  install: new InstallCommand(),
  doc: new DocCommand(),
  github: new GithubCommand(),
  browser: new BrowserCommand(),
  plan: new PlanCommand(),
  ask: new AskCommand(),  // <-- Register new command
};
```

## Step 3: Test and Validate

1. Ensure proper environment variables are set for the selected provider (e.g., OPENAI_API_KEY for OpenAI)
2. Test the command with appropriate flags:
   ```bash
   cursor-tools ask "What is the capital of France?" --provider openai --model o3-mini
   ```
3. Verify that the question is sent to the provider and the response is printed

## Notes

- Both `--provider` and `--model` parameters are required
- The command is intentionally simple and focused on just forwarding the question
- Additional options (e.g., maxTokens) can be passed via CommandOptions
- Error handling is implemented for missing parameters and provider errors 