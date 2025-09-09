#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { StandaloneMarkdownGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/**
 * Generate OpenAPI spec by calling @confytome/core
 * @param {string} configPath - Path to server config file
 * @param {Array} files - Array of JSDoc files
 * @param {string} outputDir - Output directory
 * @returns {Promise<string>} Path to generated spec file
 */
async function generateOpenApiSpec(configPath, files, outputDir) {
  return new Promise((resolve, reject) => {
    // Core package seems to use a default output directory, let's use absolute path
    const absoluteOutputDir = path.resolve(outputDir);
    const specPath = path.join(absoluteOutputDir, 'api-spec.json');

    // Ensure output directory exists
    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    // Detect config format and build appropriate command
    let args;

    if (configPath && fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Check if this is a confytome.json format (has serverConfig and routeFiles)
        if (config.serverConfig && config.routeFiles) {
          args = ['generate', '--config', configPath, '--output', absoluteOutputDir];
          console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);
        } else {
          // Traditional server config format
          args = ['openapi', '-c', configPath, '-f', ...(files || []), '-o', absoluteOutputDir];
          console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);
        }
      } catch (error) {
        reject(new Error(`Invalid config file: ${error.message}`));
        return;
      }
    } else if (files && files.length > 0) {
      reject(new Error('Config file is required when providing JSDoc files'));
      return;
    } else {
      reject(new Error('Either config file or JSDoc files must be provided'));
      return;
    }

    const child = spawn('npx', ['@confytome/core', ...args], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        // Check both expected location and core's default location
        const possiblePaths = [
          specPath,
          path.join(process.cwd(), 'confytome', 'api-spec.json'),
          path.join(absoluteOutputDir, 'confytome', 'api-spec.json')
        ];

        let foundPath = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundPath = possiblePath;
            break;
          }
        }

        if (foundPath) {
          // Move spec to expected location if it's not there
          if (foundPath !== specPath) {
            fs.copyFileSync(foundPath, specPath);
            console.log(`📋 Moved spec from ${foundPath} to ${specPath}`);
          }
          console.log(`✅ OpenAPI spec ready: ${specPath}`);
          resolve(specPath);
        } else {
          reject(new Error(`OpenAPI spec not found in any expected location: ${possiblePaths.join(', ')}`));
        }
      } else {
        reject(new Error(`@confytome/core exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start @confytome/core: ${error.message}`));
    });
  });
}

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specs')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate Markdown documentation from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './api-spec.json')
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
