import path from "node:path";
import { RepomixConfig } from 'repomix';
import { readFile, stat } from 'node:fs/promises';

export const ignorePatterns = [
  //'**/.!(cursor)/**', // negations in ignores do not work correctly
  '.*.*', // ignore dot files - we cannot add an ignore on `.*` because it will cause .cursor to be ignored
  '**/*.pbxproj',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/compile/**',
  '**/*.spec.*',
  '**/*.pyc',
  '**/.env',
  '**/.env.*',
  '**/*.env',
  '**/*.env.*',
  '**/*.lock',
  '**/*.lockb',
  '**/package-lock.*',
  '**/pnpm-lock.*',
  '**/*.tsbuildinfo',
];

export const includePatterns = ['**/*', '.cursorrules', '.cursor/rules/*'];

export const outputOptions = {
  git: {
    sortByChanges: true,
    sortByChangesMaxCommits: 10,
  },
  compress: false,
  style: 'xml',
  fileSummary: true,
  directoryStructure: true,
  removeComments: false,
  removeEmptyLines: true,
  topFilesLength: 20,
  showLineNumbers: false,
  copyToClipboard: false,
  includeEmptyDirectories: true,
  parsableStyle: false,
} as const;

const defaultConfigPath = 'repomix.config.json'

function getGlobalConfigPath() {
  // get from the home directory on windows or linux
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) {
    return null;
  }
  return path.resolve(homeDir, defaultConfigPath);
}

export const loadFileConfig = async (rootDir: string): Promise<RepomixConfig> => {
  let useDefaultConfig = false;
  let configPath = defaultConfigPath;

  const fullPath = path.resolve(rootDir, configPath);

  // Check local file existence
  const isLocalFileExists = await stat(fullPath)
    .then((stats) => stats.isFile())
    .catch(() => false);

  if (isLocalFileExists) {
    console.error('Loading repomix config from:', fullPath);
    return await loadAndValidateConfig(fullPath);
  }

  if (useDefaultConfig) {
    // Try to load global config
    const globalConfigPath = getGlobalConfigPath();
    if (!globalConfigPath) {
      return {};
    }
    console.error('Loading global repomix config from:', globalConfigPath);

    const isGlobalFileExists = await stat(globalConfigPath)
      .then((stats) => stats.isFile())
      .catch(() => false);

    if (isGlobalFileExists) {
      return await loadAndValidateConfig(globalConfigPath);
    }

    return {};
  }
  throw new Error(`Config file not found at ${configPath}`);
};

const loadAndValidateConfig = async (filePath: string): Promise<RepomixConfig> => {
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    const repomixConfig = config as RepomixConfig;
    return repomixConfig;
  } catch (error) {
    throw new Error(`Error loading config from ${filePath}: ${error}`);
  }
};
