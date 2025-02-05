import { commands } from './commands/index.ts';
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname } from 'node:path';

async function main() {
  const [, , command, ...args] = process.argv;

  // Parse options from args
  const options: {
    model?: string;
    maxTokens?: number;
    fromGithub?: string;
    output?: string;
    saveTo?: string;
  } = {};
  const queryArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key === 'model') {
        options.model = value;
      } else if (key === 'maxTokens') {
        options.maxTokens = parseInt(value, 10);
        if (isNaN(options.maxTokens)) {
          console.error('Error: maxTokens must be a number');
          process.exit(1);
        }
      } else if (key === 'fromGithub') {
        options.fromGithub = value;
      } else if (key === 'output') {
        options.output = value;
      } else if (key === 'save-to') {
        options.saveTo = value;
      }
    } else {
      queryArgs.push(arg);
    }
  }

  const query = command === 'install' && queryArgs.length === 0 ? '.' : queryArgs.join(' ');

  if (!command || !query) {
    console.error(
      'Usage: cursor-tools [--model=<model>] [--maxTokens=<number>] [--fromGithub=<github_url>] [--output=<filepath>] [--save-to=<filepath>] <command> "<query>"'
    );
    process.exit(1);
  }

  const commandHandler = commands[command];
  if (!commandHandler) {
    console.error(`Unknown command: ${command}`);
    console.error('Available commands: ' + Object.keys(commands).join(', '));
    process.exit(1);
  }

  try {
    // If saveTo is specified, ensure the directory exists and clear any existing file
    if (options.saveTo) {
      const dir = dirname(options.saveTo);
      if (dir !== '.') {
        try {
          mkdirSync(dir, { recursive: true });
        } catch (err) {
          console.error(`Error creating directory: ${dir}`, err);
          console.error('Output will not be saved to file.');
          options.saveTo = undefined;
        }
      }
      // Clear the file if it exists
      if (options.saveTo) {
        // Additional check after potential undefined assignment above
        try {
          writeFileSync(options.saveTo, '');
        } catch (err) {
          console.error(`Error clearing file: ${options.saveTo}`, err);
          console.error('Output will not be saved to file.');
          options.saveTo = undefined;
        }
      }
    }

    for await (const output of commandHandler.execute(query, options)) {
      // Write to stdout
      await new Promise((resolve) => process.stdout.write(output, resolve));

      // Write to file if saveTo is specified
      if (options.saveTo) {
        try {
          appendFileSync(options.saveTo, output);
        } catch (err) {
          console.error(`Error writing to file: ${options.saveTo}`, err);
          // Disable file writing for subsequent outputs
          options.saveTo = undefined;
        }
      }
    }
    // this should flush stdout and write a newline
    console.log('');

    if (options.saveTo) {
      console.log(`Output saved to: ${options.saveTo}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
