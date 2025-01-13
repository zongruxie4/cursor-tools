import type { Command, CommandGenerator, CommandOptions } from '../types.ts';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { homedir } from 'node:os';
import { loadEnv } from '../config.ts';

interface InstallOptions extends CommandOptions {
  packageManager?: 'npm' | 'yarn' | 'pnpm';
}

export class InstallCommand implements Command {
  private async *setupApiKeys(): CommandGenerator {
    loadEnv(); // Load existing env files if any

    const homeEnvPath = join(homedir(), '.just-ask', '.env');
    const localEnvPath = join(process.cwd(), '.just-ask.env');
    
    // Check if keys are already set
    if (process.env.PERPLEXITY_API_KEY && process.env.GEMINI_API_KEY) {
      return;
    }

    // Function to write keys to a file
    const writeKeysToFile = (filePath: string, perplexityKey: string, geminiKey: string) => {
      const envContent = `PERPLEXITY_API_KEY=${perplexityKey}\nGEMINI_API_KEY=${geminiKey}\n`;
      const dir = join(filePath, '..');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filePath, envContent, 'utf-8');
    };

    // Try to write to home directory first, fall back to local if it fails
    try {
      const perplexityKey = process.env.PERPLEXITY_API_KEY || '';
      const geminiKey = process.env.GEMINI_API_KEY || '';
      
      if (!perplexityKey) {
        yield 'Enter your Perplexity API key (or press Enter to skip): ';
        const key = await new Promise<string>(resolve => {
          process.stdin.once('data', data => resolve(data.toString().trim()));
        });
        process.env.PERPLEXITY_API_KEY = key;
      }

      if (!geminiKey) {
        yield 'Enter your Gemini API key (or press Enter to skip): ';
        const key = await new Promise<string>(resolve => {
          process.stdin.once('data', data => resolve(data.toString().trim()));
        });
        process.env.GEMINI_API_KEY = key;
      }

      try {
        writeKeysToFile(homeEnvPath, process.env.PERPLEXITY_API_KEY || '', process.env.GEMINI_API_KEY || '');
        yield 'API keys written to ~/.just-ask/.env\n';
      } catch (error) {
        // Fall back to local file if home directory write fails
        writeKeysToFile(localEnvPath, process.env.PERPLEXITY_API_KEY || '', process.env.GEMINI_API_KEY || '');
        yield 'API keys written to .just-ask.env in the current directory\n';
      }
    } catch (error) {
      yield 'Error setting up API keys. You can add them later manually.\n';
    }
  }

  async *execute(targetPath: string, options?: InstallOptions): CommandGenerator {
    const packageManager = options?.packageManager || 'npm';
    const absolutePath = join(process.cwd(), targetPath);

    // 1. Add just-ask as a dev dependency
    try {
      yield 'Adding just-ask as a dev dependency...\n';
      execSync(`${packageManager} add -D just-ask`, { cwd: absolutePath });
    } catch (error) {
      yield `Error adding dependency: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
      return;
    }

    // 2. Setup API keys
    yield 'Checking API keys setup...\n';
    yield* this.setupApiKeys();

    // 3. Update/create .cursorrules
    try {
      yield 'Updating .cursorrules...\n';
      const cursorRulesPath = join(absolutePath, '.cursorrules');
      const justAskInstructions = `
<just-ask Integration>
Use the following commands to get AI assistance:

just-ask web "your question"  - Get answers from the web using Perplexity AI
just-ask repo "your question" - Get context-aware answers about this repository using Google Gemini

just-ask web is good for getting up-to-date information from the web that are not repository specific. For example, you can ask it to get the names and details of the latest OpenAI models or details about an external API.
just-ask repo has the entire repository context available to it so it is good for repository search and tasks that require holistic understanding such as planning, debugging and answering questions about the architecture.

if just-ask is not found in your PATH, you can run it with \`npm exec just-ask "your question"\` or \`yarn just-ask "your question"\` or \`pnpm just-ask "your question"\` depending on your package manager if just-ask is installed as a dependency. If just-ask is not installed as a dependency you should fall back to using \`npx just-ask "your question"\`.

Note: configuration is in just-ask.config.json (falling back to ~/.just-ask/config.json)
Note: api keys are loaded from .just-ask.env (falling back to ~/.just-ask/.env)
</just-ask Integration>
`;

      let existingContent = '';
      if (existsSync(cursorRulesPath)) {
        existingContent = readFileSync(cursorRulesPath, 'utf-8');
      }

      // Replace existing just-ask section or append if not found
      const startTag = '<just-ask Integration>';
      const endTag = '</just-ask Integration>';
      const startIndex = existingContent.indexOf(startTag);
      const endIndex = existingContent.indexOf(endTag);

      if (startIndex !== -1 && endIndex !== -1) {
        // Replace existing section
        const newContent = existingContent.slice(0, startIndex) + 
                         justAskInstructions.trim() + 
                         existingContent.slice(endIndex + endTag.length);
        writeFileSync(cursorRulesPath, newContent);
      } else {
        // Append new section
        writeFileSync(cursorRulesPath, existingContent + justAskInstructions);
      }

      yield 'Installation completed successfully!\n';
    } catch (error) {
      yield `Error updating .cursorrules: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }
  }
} 