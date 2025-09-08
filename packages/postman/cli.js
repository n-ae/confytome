#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandalonePostmanGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/postman')
  .description('Generate Postman collections and environment variables from OpenAPI specs')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate Postman collection from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './api-spec.json')
  .option('-o, --output <path>', 'Output directory for generated files', './confytome')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .action(async(options) => {
    try {
      const generator = new StandalonePostmanGenerator(options.output, {
        specPath: path.resolve(options.spec),
        excludeBrand: !options.brand
      });

      const result = await generator.generate();
      if (result.success) {
        console.log('✅ Postman collection generation completed successfully');
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
      const generator = new StandalonePostmanGenerator('./', {
        specPath: path.resolve(options.spec)
      });

      const result = await generator.validate();
      if (result.success) {
        console.log('✅ OpenAPI specification is valid');
        console.log('✅ Ready for Postman collection generation');
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
    const metadata = StandalonePostmanGenerator.getMetadata();
    console.log(`${metadata.packageName}`);
    console.log('Standalone Postman Generator');
    console.log(`${metadata.description}`);
    console.log('OpenAPI 3.x support');
    console.log('Postman collection generation');
    console.log(`${metadata.cliCommand}`);
    console.log(`Version: ${metadata.version}`);
  });

program.parse();
