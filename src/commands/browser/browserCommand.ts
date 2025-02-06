import type { Command, CommandGenerator, CommandOptions, CommandMap } from '../../types';
import { OpenCommand } from './open.ts';
import { ElementCommand } from './element.ts';

export class BrowserCommand implements Command {
  private subcommands: CommandMap = {
    open: new OpenCommand(),
    element: new ElementCommand(),
  };

  async *execute(query: string, options?: CommandOptions): CommandGenerator {
    const [subcommand, ...rest] = query.split(' ');
    const subQuery = rest.join(' ');

    if (!subcommand) {
      yield 'Please specify a browser subcommand: open, element';
      return;
    }

    const subCommandHandler = this.subcommands[subcommand];
    if (subCommandHandler) {
      yield* subCommandHandler.execute(subQuery, options);
    } else {
      yield `Unknown browser subcommand: ${subcommand}. Available subcommands: open, element`;
    }
  }
}
