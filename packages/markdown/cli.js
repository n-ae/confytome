#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneMarkdownGenerator } from './standalone-generator.js';
import { generateOpenApiSpec } from '@confytome/core/utils/generate-openapi-spec.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specs')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate Markdown documentation from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './confytome/api-spec.json')
  .option('-c, --config <path>', 'Server config JSON file (for generating spec from JSDoc)')
  .option('-f, --files <files...>', 'JSDoc files to process (will generate OpenAPI spec if no --spec provided)')
  .option('-o, --output <path>', 'Output directory for generated files', './confytome')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .option('--no-url-encode', 'Disable URL encoding for anchor links (preserve original anchor format)')
  .action(async(options) => {
    try {
      let specPath = options.spec;

      // If spec doesn't exist but config is provided, generate spec first
      if (!fs.existsSync(specPath) && options.config) {
        console.log('🔧 No OpenAPI spec found, generating from JSDoc files...');
        specPath = await generateOpenApiSpec(options.config, options.files, options.output);
      }

      const generator = new StandaloneMarkdownGenerator(options.output, {
        specPath: path.resolve(specPath),
        excludeBrand: !options.brand,
        urlEncodeAnchors: options.urlEncode !== false // Default to true, disable with --no-url-encode
      });

      const result = await generator.generate();
      if (result.success) {
        console.log('✅ Markdown generation completed successfully');
        console.log(`📄 Generated: ${result.outputPath} (${result.size} bytes)`);
      } else {
        console.error(`❌ Generation failed: ${result.stats?.error || 'Unknown error'}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate OpenAPI spec file')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './api-spec.json')
  .action(async(options) => {
    try {
      const generator = new StandaloneMarkdownGenerator('./', {
        specPath: path.resolve(options.spec)
      });

      const result = await generator.validate();
      if (result.success) {
        console.log('✅ OpenAPI specification is valid');
        console.log('✅ Ready for Markdown generation');
      } else {
        console.error('❌ Validation failed:');
        result.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show generator information')
  .action(() => {
    const metadata = StandaloneMarkdownGenerator.getMetadata();
    console.log(`${metadata.packageName}`);
    console.log('Standalone Markdown Generator');
    console.log(`${metadata.description}`);
    console.log('OpenAPI 3.x support');
    console.log('Confluence-friendly formatting');
    console.log(`${metadata.cliCommand}`);
    console.log(`Version: ${metadata.version}`);
  });

program.parse();
