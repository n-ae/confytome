#!/usr/bin/env node

/**
 * Confluence Generator CLI
 * Generates clean Pandoc-style markdown and copies to clipboard for Confluence
 */

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneConfluenceGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('@confytome/confluence')
  .description('Pandoc-style Markdown generator for Confluence')
  .version(pkg.version)
  .option('-s, --spec <path>', 'OpenAPI spec file', './api-spec.json')
  .option('-c, --config <path>', 'Config file for generating spec from JSDoc')
  .option('-o, --output <dir>', 'Output directory', './confytome')
  .option('--no-clipboard', 'Skip copying to clipboard')
  .action(async(options) => {
    try {
      let specPath = options.spec;

      // Generate spec from JSDoc if needed
      if (!fs.existsSync(specPath) && options.config) {
        console.log('🔧 Generating OpenAPI spec from JSDoc...');
        specPath = await generateOpenApiSpec(options.config, options.output);
      }

      if (!fs.existsSync(specPath)) {
        console.error(`❌ OpenAPI spec not found: ${specPath}`);
        process.exit(1);
      }

      // Generate and copy to clipboard
      const generator = new StandaloneConfluenceGenerator(options.output, {
        specPath: path.resolve(specPath)
      });

      const result = await generator.generate({
        copyToClipboard: options.clipboard
      });

      if (!result.success) {
        console.error(`❌ Generation failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

async function generateOpenApiSpec(configPath, outputDir) {
  const { spawn } = await import('node:child_process');
  const specPath = path.join(path.resolve(outputDir), 'api-spec.json');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['@confytome/core', 'generate', '--config', configPath, '--output', outputDir], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(specPath);
      } else {
        reject(new Error(`OpenAPI generation failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to run OpenAPI generator: ${error.message}`));
    });
  });
}

program.parse();
