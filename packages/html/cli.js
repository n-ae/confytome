#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import { createCLI } from '@confytome/core/utils/cli-helper.js';
import { DEFAULT_OUTPUT_DIR, DEFAULT_CONFIG_FILES } from '@confytome/core/constants.js';
import { SimpleDocsGenerator } from './generate-html.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/html')
  .description('Generate professional styled HTML documentation from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', DEFAULT_CONFIG_FILES.CONFYTOME)
  .option('-o, --output <path>', 'Output directory for generated files', DEFAULT_OUTPUT_DIR)
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .parse(process.argv);

const htmlCLI = createCLI('html', SimpleDocsGenerator, 'Generating HTML documentation');
await htmlCLI(program, pkg);
