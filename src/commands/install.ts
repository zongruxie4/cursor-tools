import type { Command, CommandGenerator, CommandOptions } from '../types.ts';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { loadEnv } from '../config.ts';

interface InstallOptions extends CommandOptions {
  packageManager?: 'npm' | 'yarn' | 'pnpm';
}

export class InstallCommand implements Command {
  private async *setupApiKeys(): CommandGenerator {
    loadEnv(); // Load existing env files if any

    const homeEnvPath = join(homedir(), '.cursor-tools', '.env');
    const localEnvPath = join(process.cwd(), '.cursor-tools.env');

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
        const key = await new Promise<string>((resolve) => {
          process.stdin.once('data', (data) => resolve(data.toString().trim()));
        });
        process.env.PERPLEXITY_API_KEY = key;
      }

      if (!geminiKey) {
        yield 'Enter your Gemini API key (or press Enter to skip): ';
        const key = await new Promise<string>((resolve) => {
          process.stdin.once('data', (data) => resolve(data.toString().trim()));
        });
        process.env.GEMINI_API_KEY = key;
      }

      try {
        writeKeysToFile(
          homeEnvPath,
          process.env.PERPLEXITY_API_KEY || '',
          process.env.GEMINI_API_KEY || ''
        );
        yield 'API keys written to ~/.cursor-tools/.env\n';
      } catch (error) {
        console.error('Error writing API keys to home directory:', error);
        // Fall back to local file if home directory write fails
        writeKeysToFile(
          localEnvPath,
          process.env.PERPLEXITY_API_KEY || '',
          process.env.GEMINI_API_KEY || ''
        );
        yield 'API keys written to .cursor-tools.env in the current directory\n';
      }
    } catch (error) {
      console.error('Error setting up API keys:', error);
      yield 'Error setting up API keys. You can add them later manually.\n';
    }
  }

  async *execute(targetPath: string, options?: InstallOptions): CommandGenerator {
    const packageManager = options?.packageManager || 'npm/yarn/pnpm';
    const absolutePath = join(process.cwd(), targetPath);

    // 1. Add cursor-tools to package.json as a dev dependency if it exists
    const packageJsonPath = join(absolutePath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        yield 'Would you like to add cursor-tools as a dev dependency to package.json? (y/N): ';
        const answer = await new Promise<string>((resolve) => {
          process.stdin.once('data', (data) => resolve(data.toString().trim().toLowerCase()));
        });

        if (answer === 'y' || answer === 'yes') {
          yield 'Adding cursor-tools as a dev dependency to package.json...\n';
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

          if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
          }
          packageJson.devDependencies['cursor-tools'] = 'latest';

          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          yield `Please run \`${packageManager} install\` to complete the installation.\n`;
        } else {
          yield 'Skipping dev dependency installation.\n';
        }
      } catch (error) {
        yield `Error updating package.json: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        return;
      }
    } else {
      yield 'No package.json found - skipping dependency installation\n';
    }

    // 2. Setup API keys
    yield 'Checking API keys setup...\n';
    yield* this.setupApiKeys();

    // 3. Update/create .cursorrules
    try {
      yield 'Updating .cursorrules...\n';
      const cursorRulesPath = join(absolutePath, '.cursorrules');
      const justAskInstructions = `
<cursor-tools Integration>
Use the following commands to get AI assistance:

cursor-tools web "your question"  - Get answers from the web using Perplexity AI
cursor-tools repo "your question" - Get context-aware answers about this repository using Google Gemini

cursor-tools web is good for getting up-to-date information from the web that are not repository specific. For example, you can ask it to get the names and details of the latest OpenAI models or details about an external API.
cursor-tools repo has the entire repository context available to it so it is good for repository search and tasks that require holistic understanding such as planning, debugging and answering questions about the architecture.

if cursor-tools is not found in your PATH, you can run it with \`npm exec cursor-tools "your question"\` or \`yarn cursor-tools "your question"\` or \`pnpm cursor-tools "your question"\` depending on your package manager if cursor-tools is installed as a dependency. If cursor-tools is not installed as a dependency you should fall back to using \`npx cursor-tools@latest "your question"\`.

Note: configuration is in cursor-tools.config.json (falling back to ~/.cursor-tools/config.json)
Note: api keys are loaded from .cursor-tools.env (falling back to ~/.cursor-tools/.env)
</cursor-tools Integration>
`;

      let existingContent = '';
      if (existsSync(cursorRulesPath)) {
        existingContent = readFileSync(cursorRulesPath, 'utf-8');
      }

      // Replace existing cursor-tools section or append if not found
      const startTag = '<cursor-tools Integration>';
      const endTag = '</cursor-tools Integration>';
      const startIndex = existingContent.indexOf(startTag);
      const endIndex = existingContent.indexOf(endTag);

      if (startIndex !== -1 && endIndex !== -1) {
        // Replace existing section
        const newContent =
          existingContent.slice(0, startIndex) +
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
