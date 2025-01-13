import { commands } from './commands/index.ts';

async function main() {
  const [, , command, ...args] = process.argv;

  // Parse options from args
  const options: { model?: string; maxTokens?: number } = {};
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
      }
    } else {
      queryArgs.push(arg);
    }
  }

  const query = command === 'install' && queryArgs.length === 0 ? '.' : queryArgs.join(' ');

  if (!command || !query) {
    console.error(
      'Usage: cursor-tools [--model=<model>] [--maxTokens=<number>] <command> "<query>"'
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
    for await (const output of commandHandler.execute(query, options)) {
      await new Promise((resolve) => process.stdout.write(output, resolve));
    }
    // this should flush stdout and write a newline
    console.log('');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in cursor-tools:', error);
    process.exit(1);
  });
