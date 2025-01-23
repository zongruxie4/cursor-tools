export interface Config {
  perplexity: {
    model: string;
    apiKey?: string;
    maxTokens?: number;
  };
  gemini: {
    model: string;
    apiKey?: string;
    maxTokens?: number;
  };
}

export const defaultConfig: Config = {
  perplexity: {
    model: 'llama-3.1-sonar-large-128k-online',
    maxTokens: 4000,
  },
  gemini: {
    model: 'gemini-2.0-flash-thinking-exp-01-21',
    maxTokens: 10000,
  },
};

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import dotenv from 'dotenv';

export function loadConfig(): Config {
  // Try loading from current directory first
  try {
    const localConfigPath = join(process.cwd(), 'cursor-tools.config.json');
    const localConfig = JSON.parse(readFileSync(localConfigPath, 'utf-8'));
    return { ...defaultConfig, ...localConfig };
  } catch {
    // If local config doesn't exist, try home directory
    try {
      const homeConfigPath = join(homedir(), '.cursor-tools', 'config.json');
      const homeConfig = JSON.parse(readFileSync(homeConfigPath, 'utf-8'));
      return { ...defaultConfig, ...homeConfig };
    } catch {
      // If neither config exists, return default config
      return defaultConfig;
    }
  }
}

export function loadEnv(): void {
  // Try loading from current directory first
  const localEnvPath = join(process.cwd(), '.cursor-tools.env');
  if (existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
    return;
  }

  // If local env doesn't exist, try home directory
  const homeEnvPath = join(homedir(), '.cursor-tools', '.env');
  if (existsSync(homeEnvPath)) {
    dotenv.config({ path: homeEnvPath });
    return;
  }

  // If neither env file exists, continue without loading
  return;
}
