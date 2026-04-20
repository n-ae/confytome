#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneConfluenceGenerator } from './standalone-generator.js';
import { generateOpenApiSpec } from '@confytome/core/utils/generate-openapi-spec.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/confluence')
  .description('Generate Pandoc-style Markdown for Confluence from OpenAPI specs')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate Confluence-ready Markdown from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './confytome/api-spec.json')
  .option('-c, --config <path>', 'Server config JSON file (for generating spec from JSDoc)')
  .option('-f, --files <files...>', 'JSDoc files to process (will generate OpenAPI spec if no --spec provided)')
  .option('-o, --output <path>', 'Output directory for generated files', './confytome')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .option('--no-url-encode', 'Disable URL encoding for anchor links (preserve original anchor format)')
  .option('--no-clipboard', 'Skip copying markdown to clipboard')
  .action(async(options) => {
    try {
      let specPath = options.spec;

      if (!fs.existsSync(specPath) && options.config) {
        console.log('🔧 No OpenAPI spec found, generating from JSDoc files...');
        specPath = await generateOpenApiSpec(options.config, options.files, options.output);
      }

      const generator = new StandaloneConfluenceGenerator(options.output, {
        specPath: path.resolve(specPath),
        excludeBrand: !options.brand,
        urlEncodeAnchors: options.urlEncode !== false
      });

      const result = await generator.generate({
        copyToClipboard: options.clipboard !== false
      });

      if (result.success) {
        console.log('✅ Confluence Markdown generation completed successfully');
        console.log(`📄 Generated: ${result.outputPath}`);
        if (result.clipboardSuccess) {
          console.log('📋 Markdown copied to clipboard');
        }
      } else {
        console.error(`❌ Generation failed: ${result.error || 'Unknown error'}`);
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
      const generator = new StandaloneConfluenceGenerator('./', {
        specPath: path.resolve(options.spec)
      });

      const result = await generator.validate();
      if (result.success) {
        console.log('✅ OpenAPI specification is valid');
        console.log('✅ Ready for Confluence Markdown generation');
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
    const metadata = StandaloneConfluenceGenerator.getMetadata();
    console.log(`${metadata.packageName || '@confytome/confluence'}`);
    console.log('Standalone Confluence Generator');
    console.log(`${metadata.description || 'Pandoc-style Markdown generator for Confluence'}`);
    console.log('OpenAPI 3.x support');
    console.log('Clipboard integration');
    console.log(`Version: ${pkg.version}`);
  });

program.parse();
