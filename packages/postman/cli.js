#!/usr/bin/env node

/**
 * @confytome/postman CLI
 *
 * Standalone Postman generator that can be run via:
 * npx @confytome/postman --config confytome.json
 *
 * This package generates OpenAPI specs first (if needed), then creates Postman collections.
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PostmanGenerator } from './generate-postman.js';

// Package info
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/postman')
  .description('Generate Postman collections and environment variables from OpenAPI specs')
  .version(pkg.version)
  .option('-c, --config <path>', 'Path to confytome.json config file', './confytome.json')
  .option('-o, --output <path>', 'Output directory for generated files', './docs')
  .option('--spec <path>', 'Path to existing OpenAPI spec (if available)')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    console.log(`🚀 @confytome/postman v${pkg.version}`);
    console.log('');

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
      // Look for spec in default location
      specPath = path.join(options.output, 'api-spec.json');
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
        console.log('   2. Provide existing OpenAPI spec: npx @confytome/postman --spec path/to/your-spec.json');
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
          // Likely a traditional serverConfig.json - needs manual file specification
          console.error('❌ Error: Config appears to be serverConfig.json format.');
          console.log('   Use one of these approaches:');
          console.log('   1. Use confytome.json format with serverConfig and routeFiles');
          console.log('   2. Generate OpenAPI spec manually: npx @confytome/core openapi -c config.json -f your-files.js');
          console.log('   3. Provide --spec parameter with existing OpenAPI spec path');
          process.exit(1);
        }
      } else {
        console.error(`❌ Error: Config file not found: ${options.config}`);
        console.log('💡 Run "confytome init" to create configuration files');
        process.exit(1);
      }

      console.log(`   Running: ${confytomeCmd}`);

      try {
        execSync(confytomeCmd, { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Error: Failed to generate OpenAPI spec');
        console.log('💡 Make sure your confytome.json has valid serverConfig and routeFiles');
        process.exit(1);
      }
    } else if (!options.spec) {
      console.log(`📋 Using existing OpenAPI spec: ${specPath}`);
      console.log('');
    }

    // Pass the resolved spec path to the generator
    if (options.spec) {
      // For external spec files, we need to copy it to the expected location
      const targetSpecPath = path.join(options.output, 'api-spec.json');
      if (!fs.existsSync(path.dirname(targetSpecPath))) {
        fs.mkdirSync(path.dirname(targetSpecPath), { recursive: true });
      }
      fs.copyFileSync(specPath, targetSpecPath);
    }

    // Generate Postman collection and environment
    console.log('📥 Generating Postman collection and environment...');
    const generator = new PostmanGenerator();

    // Set output directory
    generator.outputDir = options.output;

    // Override spec path if provided
    if (options.spec) {
      generator.specPath = options.spec;
    }

    const result = await generator.generate();

    console.log('');
    console.log('✅ Postman generation completed!');
    console.log(`📄 Collection: ${result.collectionPath}`);
    console.log(`🌍 Environment: ${result.environmentPath}`);
    console.log(`📊 Generated ${result.requestCount} API requests`);
    console.log('');
    console.log('📖 Import both files into Postman to start testing your API!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
