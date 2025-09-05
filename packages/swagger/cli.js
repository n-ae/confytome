#!/usr/bin/env node

/**
 * @confytome/swagger CLI
 * 
 * Standalone swagger generator that can be run via:
 * npx @confytome/swagger --config confytome.json
 * 
 * This package generates OpenAPI specs first (if needed), then creates Swagger UI docs.
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { SwaggerUIGenerator } from './generate-swagger.js';

// Package info
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

const options = program.opts();

async function main() {
  try {
    console.log('🚀 @confytome/swagger v' + pkg.version);
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

      console.log('   Running: ' + confytomeCmd);

      try {
        execSync(confytomeCmd, { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Error: Failed to generate OpenAPI spec');
        console.log('💡 Make sure your confytome.json has valid serverConfig and routeFiles');
        process.exit(1);
      }
    }

    // Generate Swagger UI
    console.log('🎨 Generating Swagger UI documentation...');
    const generator = new SwaggerUIGenerator();
    
    // Set output directory and brand options
    generator.outputDir = options.output;
    generator.excludeBrand = options.brand === false;
    
    // Override spec path if provided
    if (options.spec) {
      generator.specPath = options.spec;
    }
    
    const result = await generator.generate();
    
    console.log('');
    console.log('✅ Swagger UI generation completed!');
    console.log(`📄 Generated: ${result.outputPath}`);
    console.log(`🌐 Open in browser: file://${path.resolve(result.outputPath)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();