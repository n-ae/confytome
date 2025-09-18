#!/usr/bin/env node

/**
 * Confluence Generator CLI
 *
 * Cross-platform replacement for md2confluence.ps1
 * Converts .md files to Confluence-compatible HTML and copies to clipboard
 */

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneConfluenceGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Configure CLI program
program
  .name('@confytome/confluence')
  .description('Cross-platform Markdown to Confluence converter with clipboard integration')
  .version(pkg.version);

// Main command: convert markdown file
program
  .command('convert')
  .description('Convert Markdown file to Confluence format and copy to clipboard')
  .argument('<path>', 'Path to the Markdown file (.md) to convert')
  .option('-o, --output <dir>', 'Output directory for generated files', './confytome')
  .option('--no-clipboard', 'Skip copying to clipboard')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .action(async (markdownPath, options) => {
    try {
      // Validate markdown file
      if (!markdownPath.toLowerCase().endsWith('.md')) {
        console.error('❌ Error: File must have .md extension');
        process.exit(1);
      }

      const normalizedPath = path.resolve(markdownPath);
      if (!fs.existsSync(normalizedPath)) {
        console.error(`❌ Error: File not found: ${markdownPath}`);
        process.exit(1);
      }

      // Initialize generator
      const generator = new StandaloneConfluenceGenerator(options.output, {
        markdownPath: normalizedPath,
        excludeBrand: !options.brand
      });

      // Validate generator
      const validation = await generator.validate();
      if (!validation.success) {
        console.error('❌ Validation failed:');
        validation.errors.forEach(error => console.error(`   ${error}`));
        process.exit(1);
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
      }

      // Initialize and convert
      await generator.initialize();
      const result = await generator.convertMarkdownFile(normalizedPath, {
        copyToClipboard: options.clipboard
      });

      if (result.success) {
        console.log(`\n✅ Conversion completed successfully!`);
        console.log(`📄 Output: ${result.outputPath}`);
        if (result.clipboardSuccess) {
          console.log('📋 Content copied to clipboard - ready to paste into Confluence');
        }
        process.exit(0);
      } else {
        console.error(`❌ Conversion failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Generate from OpenAPI spec command
program
  .command('generate')
  .description('Generate Confluence documentation from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './api-spec.json')
  .option('-c, --config <path>', 'Server config JSON file (for generating spec from JSDoc)')
  .option('-f, --files <files...>', 'JSDoc files to process (will generate OpenAPI spec if no --spec provided)')
  .option('-o, --output <path>', 'Output directory for generated files', './confytome')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .option('--no-clipboard', 'Skip copying to clipboard')
  .action(async (options) => {
    try {
      let specPath = options.spec;

      // Generate OpenAPI spec first if not provided but config is available
      if (!fs.existsSync(specPath) && options.config) {
        console.log('🔧 No OpenAPI spec found, generating from JSDoc files...');
        specPath = await generateOpenApiSpec(options.config, options.files, options.output);
      }

      if (!fs.existsSync(specPath)) {
        console.error(`❌ Error: OpenAPI spec not found: ${specPath}`);
        console.error('💡 Tip: Provide a valid spec file or config to generate one');
        process.exit(1);
      }

      // Initialize generator
      const generator = new StandaloneConfluenceGenerator(options.output, {
        specPath: path.resolve(specPath),
        excludeBrand: !options.brand
      });

      // Validate and generate
      const validation = await generator.validate();
      if (!validation.success) {
        console.error('❌ Validation failed:');
        validation.errors.forEach(error => console.error(`   ${error}`));
        process.exit(1);
      }

      await generator.initialize();
      const result = await generator.generate({
        copyToClipboard: options.clipboard
      });

      if (result.success) {
        console.log(`\n✅ Generation completed successfully!`);
        console.log(`📄 Output: ${result.outputPath}`);
        if (result.clipboardSuccess) {
          console.log('📋 Content copied to clipboard - ready to paste into Confluence');
        }
      } else {
        console.error(`❌ Generation failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate a Markdown file for Confluence conversion')
  .argument('<path>', 'Path to the Markdown file to validate')
  .action(async (markdownPath) => {
    try {
      const normalizedPath = path.resolve(markdownPath);
      if (!fs.existsSync(normalizedPath)) {
        console.error(`❌ Error: File not found: ${markdownPath}`);
        process.exit(1);
      }

      const generator = new StandaloneConfluenceGenerator();
      const markdownContent = fs.readFileSync(normalizedPath, 'utf8');

      const validation = generator.converter.validateMarkdown(markdownContent);

      if (validation.valid) {
        console.log('✅ Markdown file is valid for Confluence conversion');
        const title = generator.converter.extractTitle(markdownContent);
        console.log(`📝 Detected title: "${title}"`);
        console.log(`📊 File size: ${Buffer.byteLength(markdownContent, 'utf8')} bytes`);
      } else {
        console.log('❌ Markdown validation failed:');
        validation.errors.forEach(error => console.error(`   ${error}`));
      }

      if (validation.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        validation.warnings.forEach(warning => console.warn(`   ${warning}`));
      }

      process.exit(validation.valid ? 0 : 1);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Generate OpenAPI spec by calling @confytome/core
 * @param {string} configPath - Path to server config file
 * @param {Array} files - Array of JSDoc files
 * @param {string} outputDir - Output directory
 * @returns {Promise<string>} Path to generated spec file
 */
async function generateOpenApiSpec(configPath, files, outputDir) {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    const absoluteOutputDir = path.resolve(outputDir);
    const specPath = path.join(absoluteOutputDir, 'api-spec.json');

    // Ensure output directory exists
    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    // Build command arguments
    const args = ['openapi', '-c', configPath, '-o', absoluteOutputDir];
    if (files && files.length > 0) {
      args.push('-f', ...files);
    }

    console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);

    const child = spawn('npx', ['@confytome/core', ...args], {
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

// Handle default case
if (process.argv.length === 3 && process.argv[2].endsWith('.md')) {
  // If just a .md file is provided, default to convert command
  process.argv.splice(2, 0, 'convert');
}

// Parse arguments
program.parse();