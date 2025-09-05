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
import { ConfigMerger } from '@confytome/core/utils/config-merger.js';

// Package info
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', './confytome.json')
  .option('-o, --output <path>', 'Output directory for generated files', './docs')
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .parse(process.argv);

const options = program.opts();

async function main() {
  let tempConfig = null;
  
  try {
    console.log('🚀 @confytome/markdown v' + pkg.version);
    console.log('');

    // Extract and clean CLI options
    const cliOptions = ConfigMerger.extractCliOptions(options);
    const configPath = options.config || './confytome.json';
    const outputDir = options.output || './docs';
    
    // Merge CLI options with config file to create unified configuration
    tempConfig = await ConfigMerger.mergeWithConfig(configPath, cliOptions, outputDir);
    
    // Load the unified configuration
    const unifiedConfig = fs.readFileSync(tempConfig.configPath, 'utf8');
    const config = JSON.parse(unifiedConfig);

    // Check if OpenAPI spec exists or needs to be generated
    const specPath = config.specPath || path.join(config.outputDir || outputDir, 'api-spec.json');
    let needsSpecGeneration = !fs.existsSync(specPath);

    if (needsSpecGeneration) {
      console.log('📋 OpenAPI spec not found, generating it first...');
      
      // Check if confytome is available
      try {
        execSync('npx @confytome/core --version', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ Error: confytome is required to generate OpenAPI specs.');
        console.log('💡 Install it with: npm install -g @confytome/core');
        process.exit(1);
      }

      // Generate OpenAPI spec using unified config
      const confytomeCmd = `npx @confytome/core generate --config ${tempConfig.configPath}`;
      console.log('   Running: ' + confytomeCmd);
      
      try {
        execSync(confytomeCmd, { stdio: 'inherit' });
        console.log('✅ OpenAPI spec generated successfully');
        console.log('');
      } catch (error) {
        console.error('❌ Failed to generate OpenAPI spec');
        console.log('💡 Make sure your configuration has valid serverConfig and routeFiles');
        process.exit(1);
      }
    } else {
      console.log('📋 Using existing OpenAPI spec: ' + specPath);
      console.log('');
    }

    // Generate markdown documentation using unified config
    const generator = new MarkdownGenerator(config.outputDir || outputDir);
    generator.excludeBrand = config.excludeBrand;
    await generator.generate();

    console.log('');
    console.log('🎉 Markdown documentation generated successfully!');
    console.log('📄 File: ' + path.join(config.outputDir || outputDir, 'api-docs.md'));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('widdershins')) {
      console.log('💡 Install widdershins: npm install -g widdershins');
    }
    process.exit(1);
  } finally {
    // Clean up temporary config if created
    if (tempConfig) {
      ConfigMerger.cleanup(tempConfig.configPath, tempConfig.isTemporary);
    }
  }
}

// Run the main function
main().catch(console.error);
