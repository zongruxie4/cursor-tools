export type CommandGenerator = AsyncGenerator<string, void, unknown>;

export interface CommandOptions {
  model?: string;
  maxTokens?: number;
  saveTo?: string; // Path to save output to in addition to stdout
}

export interface Command {
  execute(query: string, options?: CommandOptions): CommandGenerator;
}

export interface CommandMap {
  [key: string]: Command;
}
