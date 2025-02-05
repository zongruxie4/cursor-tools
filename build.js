import * as esbuild from 'esbuild';
import { argv } from 'node:process';

const watch = argv.includes('--watch');

const buildOptions = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  minify: true,
  treeShaking: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: './dist/index.mjs',
  banner: {
    js: '#!/usr/bin/env node',
  },
  resolveExtensions: ['.ts', '.js'],
  external: [
    'node:*',
    'dotenv',
    'tiktoken',
    'repomix'
  ],
  mainFields: ['module', 'main'],
  inject: ['./src/import-meta-url.js'],
  define: {
    'import.meta.url': 'import_meta_url'
  }
};

if (watch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
   
  // eslint-disable-next-line no-undef
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
   
  // eslint-disable-next-line no-undef
  console.log('Build complete');
}
