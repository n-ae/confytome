#!/usr/bin/env node

/**
 * CLI entry point for documentation generation
 *
 * Refactored to use BaseGenerator pattern for unified error handling
 * and consistent command execution across all generators.
 */

import { program } from 'commander';
import fs from 'node:fs';
import { CliValidator } from './utils/cli-validator.js';
import { ConfigMerger } from './utils/config-merger.js';
import {
  generateOpenAPI,
  generateDemo,
  generateFromConfytomeConfig
} from './utils/cli-helpers.js';
import { getOutputDir, DEFAULT_OUTPUT_DIR, DEFAULT_CONFIG_FILES, OUTPUT_FILES } from './constants.js';

// Simplified helper functions - no complex plugin system initialization needed
// All generators are dynamically discovered by the plugin registry system

// Common CLI options to reduce duplication
const commonOptions = {
  output: '-o, --output <dir>',
  outputDir: '-o, --output-dir <dir>',
  outputDesc: `output directory (default: ${DEFAULT_OUTPUT_DIR})`,
  json: '--json',
  jsonDesc: 'output in JSON format',
  noBrand: '--no-brand',
  noBrandDesc: 'exclude confytome branding from output'
};

program
  .name('confytome')
  .description(`
🔌 Plugin-based API documentation generator with OpenAPI-first architecture

confytome generates OpenAPI 3.0.3 specifications from JSDoc-annotated code.
Use individual generator packages for other formats:
• @confytome/markdown - Confluence-friendly Markdown docs
• @confytome/swagger - Interactive Swagger UI
• @confytome/postman - Postman collections
• @confytome/html - Professional HTML docs

Quick Start:
  1. confytome init                   # Set up project structure
  2. Edit confytome.json              # Configure routes and servers
  3. confytome generate               # Generate OpenAPI spec

Traditional approach:
  confytome openapi -c serverConfig.json -f *.js

Examples:
  confytome demo                       # Try it out with example files
  confytome init --output ./api-docs   # Initialize with custom output
  confytome generate --config my-confytome.json
  confytome openapi -c config.json -f router.js controller.js

Learn more: https://github.com/n-ae/confytome#readme
`)
  .version('1.0.0');

program
  .command('generate')
  .description(`
Generate documentation using confytome.json configuration (plugin system)

Uses a simple confytome.json file to specify server config and route files.
Supports server overrides for specific route files (useful for auth routes).

Examples:
  confytome generate
  confytome generate --config ./my-confytome.json
  confytome generate --output ./api-docs
`)
  .option('-c, --config <path>', `confytome config file (default: ${DEFAULT_CONFIG_FILES.CONFYTOME})`)
  .option(commonOptions.output, commonOptions.outputDesc)
  .option('--no-brand', 'exclude confytome branding from generated documentation')
  .action(async(options) => {
    try {
      const configPath = options.config || DEFAULT_CONFIG_FILES.CONFYTOME;
      const outputDir = getOutputDir(options.output);

      // Extract and clean CLI options
      const cliOptions = ConfigMerger.extractCliOptions(options);

      // Merge CLI options with config file - returns config object directly
      const mergedConfig = ConfigMerger.mergeWithConfig(configPath, cliOptions);

      // Generate using the merged configuration object
      await generateFromConfytomeConfig(mergedConfig, outputDir);

    } catch (error) {
      console.error('❌ Generate failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('openapi')
  .description(`
Generate OpenAPI 3.0.3 specification from JSDoc comments

Creates ${OUTPUT_FILES.OPENAPI_SPEC} from your @swagger JSDoc annotations.
This is the foundation for all other documentation formats.

Examples:
  confytome openapi -c serverConfig.json -f router.js
  confytome openapi -c config.json -f src/**/*.js --output ./api-docs
`)
  .option('-c, --config <path>', 'server config JSON file (required)')
  .option('-f, --files <files...>', 'JSDoc files to process (required)')
  .option(commonOptions.output, commonOptions.outputDesc)
  .action(async(options) => {
    const files = options.files || [];
    if (!options.config || files.length === 0) {
      console.error('❌ Config file and JSDoc files are required');
      console.log('Usage: confytome openapi -c <config.json> -f <file1.js> <file2.js> ...');
      process.exit(1);
    }

    try {
      const outputDir = getOutputDir(options.output);

      // Validate config file exists
      fs.readFileSync(options.config, 'utf8');

      // Generate using direct parameters - simplified approach
      await generateOpenAPI(options.config, files, outputDir);

    } catch (error) {
      console.error('❌ OpenAPI generation failed:', error.message);
      console.log('');
      console.log('💡 Usage: confytome openapi -c <config.json> -f <file1.js> <file2.js> ...');
      process.exit(1);
    }
  });

program
  .command('init')
  .description(`
Initialize complete confytome project structure

Sets up everything you need to start generating documentation:
• Creates confytome/ directory (or custom --output location)
• Generates serverConfig.json template with OpenAPI 3.0.3 structure
• Creates confytome.json for simplified project configuration
• Creates example-router.js with JSDoc best practices
• Sets up templates/ for Markdown customization

Examples:
  confytome init                       # Standard setup
  confytome init --output ./api        # Custom documentation directory
`)
  .option(commonOptions.output, `output directory for documentation (default: ${DEFAULT_OUTPUT_DIR})`)
  .action((options) => {
    console.log('🚀 Initializing confytome documentation structure...');
    console.log('');

    const outputDir = getOutputDir(options.output);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('');

    try {
      // 1. Create directory structure
      console.log('🏗️  Creating directory structure...');
      CliValidator.createProjectStructure(outputDir);

      // 2. Copy template files
      console.log('');
      console.log('📋 Setting up configuration files...');
      const copyResults = CliValidator.copyTemplateFiles();

      // 3. Validate environment
      console.log('');
      console.log('🔍 Checking environment...');
      CliValidator.validateEnvironment();

      // 4. Final status and guidance
      console.log('');
      console.log('🎉 Initialization complete!');
      console.log('');

      // Provide context-aware next steps
      if (copyResults.configCreated || copyResults.confytomeCreated) {
        console.log('📝 Next steps:');

        if (copyResults.confytomeCreated) {
          console.log('🚀 Option 1 - Simple approach (recommended):');
          console.log('1. Edit confytome.json with your server config and route files');
          console.log('2. Run: confytome generate');
        }

        if (copyResults.configCreated) {
          console.log(copyResults.confytomeCreated ? '🔧 Option 2 - Advanced approach:' : '📝 Steps:');
          console.log('1. Edit serverConfig.json with your API details');
          if (copyResults.exampleCreated) {
            console.log('2. Review example-router.js for JSDoc documentation patterns');
            console.log('3. Generate docs: confytome all -c serverConfig.json -f example-router.js');
          } else {
            console.log('2. Document your API endpoints with JSDoc comments');
            console.log('3. Generate docs: confytome all -c serverConfig.json -f your-router.js');
          }
        }
      } else {
        console.log('💡 Quick start:');
        console.log('1. Create or edit serverConfig.json with your API configuration');
        console.log('2. Document your API endpoints with JSDoc comments');
        console.log('3. Run: confytome all -c serverConfig.json -f your-files.js');
      }

      console.log('');
      console.log('🔗 Additional commands:');
      console.log('   confytome generate                           # Use confytome.json config');
      console.log('   confytome openapi -c config.json -f file.js  # Generate OpenAPI spec only');
      console.log('   confytome swagger                            # Generate Swagger UI only');
      console.log('   confytome markdown                           # Generate Markdown only');
      console.log('   confytome postman                            # Generate Postman collection only');

      if (outputDir !== DEFAULT_OUTPUT_DIR) {
        console.log('');
        console.log(`📌 Note: Documentation will be generated to ${outputDir}/`);
      }

    } catch (error) {
      console.error('❌ Initialization failed:');
      console.error(`   ${error.message}`);
      console.log('');
      console.log('💡 Check file permissions and try again');
      process.exit(1);
    }
  });

program
  .command('demo')
  .description(`
Generate demo documentation using example files

Quick demo using bundled example-router.js and serverConfig.json.
Perfect for testing confytome or seeing what the output looks like.
Automatically runs the complete documentation pipeline.

Examples:
  confytome demo                       # Generate demo
  confytome demo --output ./demo    # Custom output directory
`)
  .option(commonOptions.output, commonOptions.outputDesc)
  .action(async(options) => {
    const outputDir = getOutputDir(options.output);

    console.log('🚀 Running confytome demo with example files...');
    console.log('');
    console.log(`📂 Output directory: ${outputDir}`);
    console.log('');

    try {
      // Check if example files exist, create if needed
      const exampleRouter = './example-router.js';
      const exampleConfig = './serverConfig.json';

      if (!fs.existsSync(exampleRouter) || !fs.existsSync(exampleConfig)) {
        console.log('📋 Example files not found - initializing first...');
        console.log('');

        // Run init to create example files
        CliValidator.createProjectStructure(outputDir);
        const copyResults = CliValidator.copyTemplateFiles();

        if (!copyResults.exampleCreated || !copyResults.configCreated) {
          console.error('❌ Failed to create example files');
          console.log('💡 Try running: confytome init');
          process.exit(1);
        }

        console.log('✅ Example files created');
        console.log('');
      }

      console.log('🔄 Generating demo documentation...');
      console.log('');

      // Run demo generation using simplified system
      await generateDemo(outputDir);

      console.log('\n🎉 Demo documentation generated successfully!');
      console.log('');
      console.log(`Generated demo files in ${outputDir}:`);
      console.log(`- ${OUTPUT_FILES.OPENAPI_SPEC} (OpenAPI 3.0.3 specification)`);
      console.log(`- ${OUTPUT_FILES.HTML_DOCS} (Professional HTML documentation)`);
      console.log(`- ${OUTPUT_FILES.SWAGGER_UI} (Interactive Swagger UI)`);
      console.log(`- ${OUTPUT_FILES.MARKDOWN_DOCS} (Confluence-friendly Markdown)`);
      console.log(`- ${OUTPUT_FILES.POSTMAN_COLLECTION} (Postman collection)`);
      console.log(`- ${OUTPUT_FILES.POSTMAN_ENVIRONMENT} (Postman environment)`);
      console.log('');
      console.log(`🌟 Open ${OUTPUT_FILES.SWAGGER_UI} in your browser to explore the API!`);

    } catch (error) {
      console.error('❌ Demo generation failed');
      console.error('Error:', error.message);
      console.log('');
      console.log('💡 Try running: confytome init');
      console.log('💡 Then edit serverConfig.json and run: confytome demo');
      process.exit(1);
    }
  });

// Import plugin management functions
import {
  listGenerators,
  showGeneratorInfo,
  showRecommendedGenerators,
  validateGenerators,
  executeGenerators,
  executeAllSpecConsumers
} from './utils/cli-plugins.js';

// Plugin management commands
program
  .command('generators')
  .alias('list')
  .description(`
List all available generators from plugin registry

Shows all generators found in the workspace and external plugins,
including their availability, compatibility, and dependency status.

Examples:
  confytome generators              # List all generators
  confytome generators --json       # JSON output for scripting
`)
  .option(commonOptions.json, commonOptions.jsonDesc)
  .action(listGenerators);

program
  .command('info <generator>')
  .description(`
Show detailed plugin information and compatibility status

Displays comprehensive information including dependencies, metadata,
compatibility status, and troubleshooting information.

Examples:
  confytome info generate-html      # Show HTML generator details
  confytome info generate-markdown  # Show Markdown generator details
`)
  .option(commonOptions.json, commonOptions.jsonDesc)
  .action(showGeneratorInfo);

program
  .command('recommended')
  .description(`
Show compatible generators based on current system

Lists generators that are ready to use with your current setup,
helping you choose the best options for your project.

Examples:
  confytome recommended             # Show recommended generators
  confytome recommended --json      # JSON output
`)
  .option(commonOptions.json, commonOptions.jsonDesc)
  .action(showRecommendedGenerators);

program
  .command('validate [generators...]')
  .description(`
Validate plugin compatibility and dependencies

Checks if specified generators (or all generators if none specified)
are properly configured and have all required dependencies.

Examples:
  confytome validate                # Validate all generators
  confytome validate generate-html  # Validate specific generator
  confytome validate generate-html generate-markdown
`)
  .option(commonOptions.json, commonOptions.jsonDesc)
  .action(validateGenerators);

program
  .command('run <generators...>')
  .description(`
Execute specific plugins from the generator registry

Runs the specified generators in dependency order, ensuring that
OpenAPI spec generators run before documentation generators.

Examples:
  confytome run generate-html       # Run HTML generator
  confytome run generate-html generate-markdown generate-swagger
  confytome run generate-html --no-brand  # Run without branding
`)
  .option(commonOptions.outputDir, commonOptions.outputDesc)
  .option('--fail-fast', 'stop on first generator failure')
  .option(commonOptions.noBrand, commonOptions.noBrandDesc)
  .action(executeGenerators);

program
  .command('run-all')
  .description(`
Execute all available spec consumer plugins

Runs all generators that consume OpenAPI specifications (HTML, Markdown,
Swagger UI, etc.) but skips spec creation generators.

Examples:
  confytome run-all                 # Run all spec consumers
  confytome run-all --no-brand      # Run without branding
`)
  .option(commonOptions.outputDir, commonOptions.outputDesc)
  .option('--fail-fast', 'stop on first generator failure')
  .option(commonOptions.noBrand, commonOptions.noBrandDesc)
  .action(executeAllSpecConsumers);

program.parse();
