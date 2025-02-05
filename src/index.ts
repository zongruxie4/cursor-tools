import { commands } from './commands/index.ts';
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCursorRules } from './cursorrules.ts';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to normalize argument keys
function normalizeArgKey(key: string): string {
  // Convert from kebab-case to lowercase without hyphens
  return key.toLowerCase().replace(/-/g, '');
}

// Helper function to convert camelCase to kebab-case
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

interface Options {
  model?: string;
  maxTokens?: number;
  fromGithub?: string;
  output?: string;
  saveTo?: string;
  hint?: string;
}

type OptionKey = keyof Options;

// Map of normalized keys to their option names in the options object
const OPTION_KEYS: { [key: string]: OptionKey } = {
  model: 'model',
  maxtokens: 'maxTokens',
  output: 'output',
  saveto: 'saveTo',
  fromgithub: 'fromGithub',
  hint: 'hint',
};

async function main() {
  const [, , command, ...args] = process.argv;

  // Parse options from args
  const options: Options = {};
  const queryArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      // Handle both --key=value and --key value formats
      let key: string;
      let value: string | undefined;

      const equalIndex = arg.indexOf('=');
      if (equalIndex !== -1) {
        // --key=value format
        key = arg.slice(2, equalIndex);
        value = arg.slice(equalIndex + 1);
      } else {
        // --key value format
        key = arg.slice(2);
        // Check if there's a next argument that isn't another flag
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          value = args[i + 1];
          i++; // Skip the next argument since we've used it as the value
        }
      }

      // Normalize and validate the key
      const normalizedKey = normalizeArgKey(key.toLowerCase());
      const optionKey = OPTION_KEYS[normalizedKey];

      if (!optionKey) {
        console.error(`Error: Unknown option '--${key}'`);
        console.error(
          'Available options:',
          Array.from(new Set(Object.values(OPTION_KEYS)))
            .map((k) => `--${toKebabCase(k)}`)
            .join(', ')
        );
        process.exit(1);
      }

      if (value === undefined) {
        console.error(`Error: No value provided for option '--${key}'`);
        process.exit(1);
      }

      if (optionKey === 'maxTokens') {
        const tokens = parseInt(value, 10);
        if (isNaN(tokens)) {
          console.error('Error: maxTokens must be a number');
          process.exit(1);
        }
        options.maxTokens = tokens;
      } else {
        options[optionKey] = value;
      }
    } else {
      queryArgs.push(arg);
    }
  }

  const query = command === 'install' && queryArgs.length === 0 ? '.' : queryArgs.join(' ');

  if (!command) {
    console.error(
      'Usage: cursor-tools [--model=<model>] [--max-tokens=<number>] [--from-github=<github_url>] [--output=<filepath>] [--save-to=<filepath>] [--hint=<hint>] <command> "<query>"\n' +
        '       Note: Options can be specified in kebab-case (--max-tokens) or camelCase (--maxTokens)\n' +
        '       Both --key=value and --key value formats are supported'
    );
    process.exit(1);
  }

  const commandHandler = commands[command];
  if (!commandHandler) {
    console.error(`Unknown command: ${command}`);
    console.error('Available commands: ' + Object.keys(commands).join(', '));
    process.exit(1);
  }

  // Check .cursorrules version unless running the install command
  if (command !== 'install') {
    const { needsUpdate, message } = checkCursorRules(process.cwd());
    if (needsUpdate && message) {
      console.error('\x1b[33m%s\x1b[0m', `Warning: ${message}`); // Yellow text
    }
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

    // Pass an empty string as the query for 'doc' and 'install' commands
    const executeQuery = command === 'doc' || command === 'install' ? '' : query;

    for await (const output of commandHandler.execute(executeQuery, options)) {
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
    // this should flush stderr and stdout and write a newline
    console.log('');
    console.error('');

    if (options.saveTo) {
      console.error(`Output saved to: ${options.saveTo}`);
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
