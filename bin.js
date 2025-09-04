#!/usr/bin/env node

/**
 * CLI entry point for documentation generation
 * 
 * Refactored to use BaseGenerator pattern for unified error handling
 * and consistent command execution across all generators.
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { CliValidator } from './utils/cli-validator.js';
import { SimpleErrorHandler } from './utils/error-handler-simple.js';
import {
  generateAllDocs,
  generateOpenAPI,
  generateFromSpec,
  generateDemo,
  getGeneratorInfo,
  generateFromConfytomeConfig
} from './utils/cli-helpers.js';
const require = createRequire(import.meta.url);

// Watch mode helper function
async function startWatchMode(configPath, files, outputDir) {
  console.log('👁️  Watch mode enabled - monitoring files for changes...');
  console.log(`   Config: ${configPath}`);
  console.log(`   Files: ${files.join(', ')}`);
  console.log(`   Output: ${outputDir}`);
  console.log('   Press Ctrl+C to stop watching');
  console.log('');

  const watchedFiles = [configPath, ...files];
  let isGenerating = false;
  let pendingRegeneration = false;

  // Debounce function to avoid multiple rapid regenerations
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const generateDocs = debounce(async () => {
    if (isGenerating) {
      pendingRegeneration = true;
      return;
    }

    isGenerating = true;
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      console.log(`\n🔄 [${timestamp}] File change detected - regenerating documentation...`);
      
      // Run the same generation logic as the non-watch mode
      await generateAllDocs(configPath, files, outputDir);
      
      console.log(`✅ [${timestamp}] Regeneration complete!`);
      console.log('👁️  Watching for changes...\n');

    } catch (error) {
      console.error(`❌ [${timestamp}] Regeneration failed:`, error.message);
      console.log('👁️  Watching for changes...\n');
    } finally {
      isGenerating = false;
      
      // If there was a pending regeneration request, handle it
      if (pendingRegeneration) {
        pendingRegeneration = false;
        setTimeout(() => generateDocs(), 100);
      }
    }
  }, 500); // 500ms debounce

  // Watch all files
  const watchers = watchedFiles.map(file => {
    if (fs.existsSync(file)) {
      return fs.watch(file, (eventType) => {
        if (eventType === 'change') {
          generateDocs();
        }
      });
    }
    return null;
  }).filter(Boolean);

  // Initial generation
  await generateDocs();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping watch mode...');
    watchers.forEach(watcher => watcher.close());
    console.log('👋 Watch mode stopped');
    process.exit(0);
  });

  // Keep the process running
  return new Promise(() => {}); // Never resolves, keeps watching
}

// Simplified helper functions - no complex plugin system initialization needed
// All generators are directly imported in cli-helpers.js

program
  .name('confytome')
  .description('🍃 Generate comprehensive API documentation from JSDoc comments\n\n' +
    'Confytome transforms your JSDoc-annotated code into multiple documentation formats:\n' +
    '• OpenAPI 3.0.3 specifications\n' +
    '• Interactive Swagger UI\n' +
    '• Confluence-friendly Markdown\n' +
    '• Professional HTML docs\n' +
    '• Postman collections & environments\n\n' +
    'Quick Start:\n' +
    '  1. confytome init                    # Set up project structure\n' +
    '  2. Edit confytome.json              # Configure routes and servers\n' +
    '  3. confytome generate               # Generate all documentation\n\n' +
    'Alternative approach:\n' +
    '  confytome all -c serverConfig.json -f *.js  # Traditional config\n\n' +
    'Examples:\n' +
    '  confytome demo                       # Try it out with example files\n' +
    '  confytome init --output ./api-docs   # Initialize with custom output\n' +
    '  confytome generate --config my-confytome.json\n' +
    '  confytome openapi -c config.json -f router.js controller.js\n' +
    '  confytome all -c config.json -f src/**/*.js --watch\n' +
    '  confytome markdown --output ./docs\n\n' +
    'Learn more: https://github.com/n-ae/portfolio/confytome#readme')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate documentation using confytome.json configuration\n\n' +
    'Uses a simple confytome.json file to specify server config and route files.\n' +
    'Supports server overrides for specific route files (useful for auth routes).\n\n' +
    'Examples:\n' +
    '  confytome generate\n' +
    '  confytome generate --config ./my-confytome.json\n' +
    '  confytome generate --output ./api-docs')
  .option('-c, --config <path>', 'confytome config file (default: ./confytome.json)')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    try {
      await generateFromConfytomeConfig(options.config || './confytome.json', options.output || './docs');
    } catch (error) {
      console.error('❌ Generate failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('openapi')
  .description('Generate OpenAPI 3.0.3 specification from JSDoc comments\n\n' +
    'Creates api-spec.json from your @swagger JSDoc annotations.\n' +
    'This is the foundation for all other documentation formats.\n\n' +
    'Examples:\n' +
    '  confytome openapi -c serverConfig.json -f router.js\n' +
    '  confytome openapi -c config.json -f src/**/*.js --output ./api-docs')
  .option('-c, --config <path>', 'server config JSON file (required)')
  .option('-f, --files <files...>', 'JSDoc files to process (required)')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    const files = options.files || [];
    if (!options.config || files.length === 0) {
      console.error('❌ Config file and JSDoc files are required');
      console.log('Usage: confytome openapi -c <config.json> -f <file1.js> <file2.js> ...');
      process.exit(1);
    }
    
    try {
      await generateOpenAPI(options.config, files, options.output);
    } catch (error) {
      console.error('❌ OpenAPI generation failed:', error.message);
      console.log('');
      console.log('💡 Usage: confytome openapi -c <config.json> -f <file1.js> <file2.js> ...');
      process.exit(1);
    }
  });

program
  .command('markdown')
  .description('Generate Confluence-friendly Markdown from OpenAPI spec\n\n' +
    'Creates api-docs.md using custom widdershins templates for clean, readable docs.\n' +
    'Requires an existing OpenAPI spec (run openapi command first).\n\n' +
    'Examples:\n' +
    '  confytome markdown\n' +
    '  confytome markdown --output ./documentation')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    try {
      await generateFromSpec('markdown', options.output || './docs');
    } catch (error) {
      console.error('❌ Markdown generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('swagger')
  .description('Generate interactive Swagger UI documentation\n\n' +
    'Creates swagger-ui-static.html with fully interactive API explorer.\n' +
    'Requires an existing OpenAPI spec (run openapi command first).\n\n' +
    'Examples:\n' +
    '  confytome swagger\n' +
    '  confytome swagger --output ./docs')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    try {
      await generateFromSpec('swagger', options.output || './docs');
    } catch (error) {
      console.error('❌ Swagger UI generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Generate all documentation formats in sequence\\n\\n' +
    'Runs the complete OpenAPI-first documentation pipeline:\\n' +
    '1. OpenAPI 3.0.3 specification\\n' +
    '2. Interactive Swagger UI\\n' +
    '3. Confluence-friendly Markdown\\n' +
    '4. Professional HTML docs\\n' +
    '5. Postman collection & environment\\n\\n' +
    'Examples:\\n' +
    '  confytome all -c serverConfig.json -f router.js\\n' +
    '  confytome all -c config.json -f src/**/*.js --output ./api-docs\\n' +
    '  confytome all -c config.json -f *.js --watch  # Watch mode')
  .option('-c, --config <path>', 'server config JSON file')
  .option('-f, --files <files...>', 'JSDoc files to process')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .option('-w, --watch', 'watch for file changes and regenerate automatically')
  .action(async (options) => {
    const files = options.files || [];
    if (!options.config || files.length === 0) {
      console.error('❌ Config file and JSDoc files are required');
      console.log('Usage: confytome all -c <config.json> -f <file1.js> <file2.js> ...');
      console.log('');
      CliValidator.showOpenAPIUsage('generate-all');
      process.exit(1);
    }
    
    // Validate arguments before processing
    const args = [options.config, ...files];
    const outputDir = options.output || './docs';
    CliValidator.validateOpenAPIArgs(args, 'generate-all');
    
    // Check if watch mode is enabled
    if (options.watch) {
      return await startWatchMode(options.config, files, outputDir);
    }
    
    console.log('🚀 Generating all documentation formats (OpenAPI-first architecture)...');
    console.log('');
    console.log(`📁 Server config: ${options.config}`);
    console.log(`📄 JSDoc files: ${files.join(', ')}`);
    console.log(`📂 Output directory: ${outputDir}`);
    console.log('');
    
    // Run generators in sequence
    try {
      await generateAllDocs(options.config, files, outputDir);
      
      console.log('\n🎉 All documentation formats generated successfully!');
      console.log('');
      console.log(`Generated files in ${outputDir}:`);
      console.log('- api-spec.json (OpenAPI 3.0.3 specification)');
      console.log('- api-docs.html (Professional HTML documentation)');
      console.log('- swagger-ui-static.html (Interactive Swagger UI)');
      console.log('- api-docs.md (Confluence-friendly Markdown)');
      console.log('- api-postman.json (Postman collection)');
      console.log('- api-postman-env.json (Postman environment)');
      
    } catch (error) {
      console.error('❌ Generation failed at one of the steps');
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize complete Confytome project structure\\n\\n' +
    'Sets up everything you need to start generating documentation:\\n' +
    '• Creates docs/ directory (or custom --output location)\\n' +
    '• Generates serverConfig.json template with OpenAPI 3.0.3 structure\\n' +
    '• Creates confytome.json for simplified project configuration\\n' +
    '• Creates example-router.js with JSDoc best practices\\n' +
    '• Sets up widdershins-templates/ for Markdown customization\\n\\n' +
    'Examples:\\n' +
    '  confytome init                    # Standard setup in ./docs/\\n' +
    '  confytome init --output ./api     # Custom documentation directory')
  .option('-o, --output <dir>', 'output directory for documentation (default: ./docs)')
  .action((options) => {
    console.log('🚀 Initializing confytome documentation structure...');
    console.log('');
    
    const outputDir = options.output || './docs';
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
      console.log('   confytome generate                          # Use confytome.json config');
      console.log('   confytome openapi -c config.json -f file.js  # Generate OpenAPI spec only');
      console.log('   confytome swagger                           # Generate Swagger UI only');
      console.log('   confytome markdown                          # Generate Markdown only');
      console.log('   confytome postman                           # Generate Postman collection only');
      
      if (outputDir !== './docs') {
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
  .command('html')
  .description('Generate professional HTML documentation\\n\\n' +
    'Creates api-docs.html with clean, professional styling.\\n' +
    'Requires an existing OpenAPI spec (run openapi command first).\\n\\n' +
    'Examples:\\n' +
    '  confytome html                    # Generate in ./docs/\\n' +
    '  confytome html --output ./public  # Custom output directory')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    try {
      await generateFromSpec('html', options.output || './docs');
    } catch (error) {
      console.error('❌ HTML generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('postman')
  .description('Generate Postman collection and environment variables\\n\\n' +
    'Creates ready-to-import Postman collection with:\\n' +
    '• All API endpoints from OpenAPI spec\\n' +
    '• Environment variables for base URLs\\n' +
    '• Pre-configured authentication headers\\n' +
    'Requires an existing OpenAPI spec (run openapi command first).\\n\\n' +
    'Examples:\\n' +
    '  confytome postman                 # Generate in ./docs/\\n' +
    '  confytome postman --output ./api  # Custom output directory')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    try {
      await generateFromSpec('postman', options.output || './docs');
    } catch (error) {
      console.error('❌ Postman generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Generate demo documentation using example files\\n\\n' +
    'Quick demo using bundled example-router.js and serverConfig.json.\\n' +
    'Perfect for testing Confytome or seeing what the output looks like.\\n' +
    'Automatically runs the complete documentation pipeline.\\n\\n' +
    'Examples:\\n' +
    '  confytome demo                    # Generate demo in ./docs/\\n' +
    '  confytome demo --output ./demo    # Custom output directory')
  .option('-o, --output <dir>', 'output directory (default: ./docs)')
  .action(async (options) => {
    const outputDir = options.output || './docs';
    
    console.log('🚀 Running Confytome demo with example files...');
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
      
      console.log('\\n🎉 Demo documentation generated successfully!');
      console.log('');
      console.log(`Generated demo files in ${outputDir}:`);
      console.log('- api-spec.json (OpenAPI 3.0.3 specification)');
      console.log('- api-docs.html (Professional HTML documentation)');
      console.log('- api-swagger.html (Interactive Swagger UI)');
      console.log('- api-docs.md (Confluence-friendly Markdown)');
      console.log('- api-postman.json (Postman collection)');
      console.log('- api-postman-env.json (Postman environment)');
      console.log('');
      console.log('🌟 Open api-swagger.html in your browser to explore the API!');
      
    } catch (error) {
      console.error('❌ Demo generation failed');
      console.error('Error:', error.message);
      console.log('');
      console.log('💡 Try running: confytome init');
      console.log('💡 Then edit serverConfig.json and run: confytome demo');
      process.exit(1);
    }
  });

program.parse();
