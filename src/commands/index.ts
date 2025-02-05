import type { CommandMap } from '../types.ts';
import { WebCommand } from './web.ts';
import { RepoCommand } from './repo.ts';
import { InstallCommand } from './install.ts';
import { DocCommand } from './doc.ts';

export const commands: CommandMap = {
  web: new WebCommand(),
  repo: new RepoCommand(),
  install: new InstallCommand(),
  doc: new DocCommand(),
};
