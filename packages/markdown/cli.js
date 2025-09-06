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
    console.log(`🚀 @confytome/markdown v${pkg.version}`);
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
    // First check if user provided existing spec via --spec option
    let specPath;
    let needsSpecGeneration = false;

    if (options.spec) {
      // User provided existing spec file
      specPath = path.resolve(options.spec);
      if (!fs.existsSync(specPath)) {
        console.error(`❌ Error: Specified OpenAPI spec file not found: ${specPath}`);
        process.exit(1);
      }
      console.log(`📋 Using provided OpenAPI spec: ${specPath}`);
    } else {
      // Look for spec in config or default location
      specPath = config.specPath || path.join(config.outputDir || outputDir, 'api-spec.json');
      needsSpecGeneration = !fs.existsSync(specPath);
    }

    if (needsSpecGeneration) {
      console.log('📋 OpenAPI spec not found, generating it first...');
      console.log('   This requires @confytome/core to generate the spec from your API code.');

      // Check if confytome is available only when we actually need it
      try {
        execSync('npx @confytome/core --version', { stdio: 'ignore' });
      } catch (error) {
        console.error('❌ Error: @confytome/core is required to generate OpenAPI specs from your API code.');
        console.log('');
        console.log('💡 You have two options:');
        console.log('   1. Install @confytome/core: npm install -g @confytome/core');
        console.log('   2. Provide existing OpenAPI spec: npx @confytome/markdown --spec path/to/your-spec.json');
        process.exit(1);
      }

      // Generate OpenAPI spec using unified config
      const confytomeCmd = `npx @confytome/core generate --config ${tempConfig.configPath}`;
      console.log(`   Running: ${confytomeCmd}`);

      try {
        execSync(confytomeCmd, { stdio: 'inherit' });
        console.log('✅ OpenAPI spec generated successfully');
        console.log('');
      } catch (error) {
        console.error('❌ Failed to generate OpenAPI spec');
        console.log('💡 Make sure your configuration has valid serverConfig and routeFiles');
        process.exit(1);
      }
    } else if (!options.spec) {
      console.log(`📋 Using existing OpenAPI spec: ${specPath}`);
      console.log('');
    }

    // Generate markdown documentation using unified config
    const generator = new MarkdownGenerator(config.outputDir || outputDir);
    generator.excludeBrand = config.excludeBrand;

    // Pass the resolved spec path to the generator
    if (options.spec) {
      // For external spec files, we need to copy it to the expected location
      const targetSpecPath = path.join(config.outputDir || outputDir, 'api-spec.json');
      if (!fs.existsSync(path.dirname(targetSpecPath))) {
        fs.mkdirSync(path.dirname(targetSpecPath), { recursive: true });
      }
      fs.copyFileSync(specPath, targetSpecPath);
    }

    await generator.generate();

    console.log('');
    console.log('🎉 Markdown documentation generated successfully!');
    console.log(`📄 File: ${path.join(config.outputDir || outputDir, 'api-docs.md')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('widdershins')) {
      console.log('💡 widdershins will be installed automatically via npx');
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
