#!/usr/bin/env node

/**
 * @confytome/markdown CLI
 * 
 * Standalone markdown generator that can be run via:
 * npx @confytome/markdown --config confytome.json
 * 
 * This package generates OpenAPI specs first (if needed), then creates markdown docs.
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { MarkdownGenerator } from './generate-markdown.js';

// Package info
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', './confytome.json')
  .option('-o, --output <path>', 'Output directory for generated files', './docs')
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    console.log('🚀 @confytome/markdown v' + pkg.version);
    console.log('');

    // Check if OpenAPI spec exists or needs to be generated
    const specPath = options.spec || path.join(options.output, 'api-spec.json');
    let needsSpecGeneration = !fs.existsSync(specPath);

    if (needsSpecGeneration) {
      console.log('📋 OpenAPI spec not found, generating it first...');

      // Check if confytome is available
      try {
        execSync('npx @confytome/core --version', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ Error: confytome is required to generate OpenAPI specs.');
        console.log('💡 Install it with: npm install -g @confytome/core');
        console.log('   Or manually run: npx @confytome/core generate --config ' + options.config);
        process.exit(1);
      }

      // Determine which confytome command to use based on config type
      let confytomeCmd;
      if (fs.existsSync(options.config)) {
        const configContent = fs.readFileSync(options.config, 'utf8');
        const config = JSON.parse(configContent);
        
        // Check if it's a confytome.json (has serverConfig + routeFiles) or traditional serverConfig.json
        if (config.serverConfig && config.routeFiles) {
          // It's a confytome.json file
          confytomeCmd = `npx @confytome/core generate --config ${options.config} --output ${options.output}`;
        } else {
          // It's a traditional server config, need to find route files
          console.error('❌ Error: Traditional serverConfig.json detected, but route files not specified.');
          console.log('💡 Options:');
          console.log('   1. Use confytome.json format with serverConfig and routeFiles');
          console.log('   2. Generate OpenAPI spec manually: npx @confytome/core openapi -c config.json -f your-files.js');
          process.exit(1);
        }
      } else {
        console.error('❌ Error: Configuration file not found: ' + options.config);
        process.exit(1);
      }

      console.log('   Running: ' + confytomeCmd);
      
      try {
        execSync(confytomeCmd, { stdio: 'inherit' });
        console.log('✅ OpenAPI spec generated successfully');
        console.log('');
      } catch (error) {
        console.error('❌ Failed to generate OpenAPI spec');
        console.log('💡 Make sure your confytome.json has valid serverConfig and routeFiles');
        process.exit(1);
      }
    } else {
      console.log('📋 Using existing OpenAPI spec: ' + specPath);
      console.log('');
    }

    // Generate markdown documentation
    const generator = new MarkdownGenerator(options.output);
    await generator.generate();

    console.log('');
    console.log('🎉 Markdown documentation generated successfully!');
    console.log('📄 File: ' + path.join(options.output, 'api-docs.md'));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('widdershins')) {
      console.log('💡 Install widdershins: npm install -g widdershins');
    }
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
