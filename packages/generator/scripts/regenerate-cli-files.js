#!/usr/bin/env node
/**
 * Regenerate CLI Files Script
 *
 * Uses Mustache templates to regenerate CLI files
 * across all generator packages to eliminate repetition.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeCLIFile } from '../src/template-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../../..');
const packagesDir = path.join(workspaceRoot, 'packages');

// Generator configurations
const GENERATORS = [
  {
    type: 'html',
    path: path.join(packagesDir, 'html'),
    cliHelper: 'cli-helper.js' // Note: some use cli-helper vs cli-helpers
  },
  {
    type: 'markdown',
    path: path.join(packagesDir, 'markdown'),
    cliHelper: 'cli-helpers.js'
  },
  {
    type: 'swagger',
    path: path.join(packagesDir, 'swagger'),
    cliHelper: 'cli-helper.js'
  },
  {
    type: 'postman',
    path: path.join(packagesDir, 'postman'),
    cliHelper: 'cli-helper.js'
  }
];

/**
 * Main regeneration function
 */
async function regenerateFiles() {
  console.log('🚀 Regenerating CLI files...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const generator of GENERATORS) {
    try {
      console.log(`📝 Processing ${generator.type} generator...`);

      // Check if package directory exists
      if (!fs.existsSync(generator.path)) {
        console.warn(`⚠️  Package directory not found: ${generator.path}`);
        continue;
      }

      // Generate CLI file with correct helper import
      const cliOptions = {
        cliHelper: generator.cliHelper
      };

      const cliPath = await writeCLIFile(generator.type, generator.path, cliOptions);
      console.log(`✅ Generated CLI: ${path.relative(workspaceRoot, cliPath)}`);

      successCount++;
      console.log('');

    } catch (error) {
      console.error(`❌ Error processing ${generator.type}:`, error.message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully processed: ${successCount} generators`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
    process.exit(1);
  } else {
    console.log('🎉 All generators updated successfully!');
  }
}

/**
 * Validate existing files before regenerating
 */
function validateExistingFiles() {
  console.log('🔍 Validating existing files...\n');

  for (const generator of GENERATORS) {
    const cliPath = path.join(generator.path, 'cli.js');
    const manifestPath = path.join(generator.path, 'confytome-plugin.json');

    console.log(`Checking ${generator.type}:`);
    console.log(`  CLI: ${fs.existsSync(cliPath) ? '✅ exists' : '❌ missing'}`);
    console.log(`  Manifest: ${fs.existsSync(manifestPath) ? '✅ exists' : '❌ missing'}`);
  }
  console.log('');
}

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--validate')) {
  validateExistingFiles();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node regenerate-cli-files.js [options]

Options:
  --validate    Validate existing files without regenerating
  --help, -h    Show this help message

This script uses Mustache templates to regenerate CLI files and plugin
manifests across all generator packages, eliminating repetition and
ensuring consistency.
  `);
} else {
  // Default action: regenerate files
  validateExistingFiles();
  await regenerateFiles();
}
