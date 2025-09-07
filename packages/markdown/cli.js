#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import { createCLI } from '@confytome/core/utils/cli-helpers.js';
import { DEFAULT_OUTPUT_DIR, DEFAULT_CONFIG_FILES } from '@confytome/core/constants.js';
import { MarkdownGenerator } from './generate-markdown.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', DEFAULT_CONFIG_FILES.CONFYTOME)
  .option('-o, --output <path>', 'Output directory for generated files', DEFAULT_OUTPUT_DIR)
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .parse(process.argv);

const markdownCLI = createCLI('markdown', MarkdownGenerator, 'Generating Markdown documentation');
await markdownCLI(program, pkg);
