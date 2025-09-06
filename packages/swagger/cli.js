#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import { createCLI } from '@confytome/core/utils/cli-helper.js';
import { SwaggerUIGenerator } from './generate-swagger.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/swagger')
  .description('Generate interactive Swagger UI documentation from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', './confytome.json')
  .option('-o, --output <path>', 'Output directory for generated files', './docs')
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .parse(process.argv);

const swaggerCLI = createCLI('swagger', SwaggerUIGenerator, 'Generating Swagger UI documentation');
await swaggerCLI(program, pkg);
