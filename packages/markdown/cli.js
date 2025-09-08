#!/usr/bin/env node

/**
 * Standalone CLI for @confytome/markdown
 *
 * Generates Confluence-friendly Markdown documentation from OpenAPI specifications
 * using Mustache templates. Can be used independently of the core confytome system.
 */

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { StandaloneMarkdownGenerator } from './standalone-generator.js';

// Helper function to get output directory
function getOutputDir(outputDir) {
  return outputDir || './confytome';
}

// Helper function to check if OpenAPI spec exists
function checkOpenAPISpec(specPath) {
  if (!fs.existsSync(specPath)) {
    console.error(`❌ OpenAPI specification not found: ${specPath}`);
    console.log('💡 Generate an OpenAPI spec first with one of these methods:');
    console.log('   - Use @confytome/core: npx @confytome/core openapi -c config.json -f *.js');
    console.log('   - Place your OpenAPI spec at: ${specPath}');
    console.log('   - Use --spec flag to specify a different location');
    process.exit(1);
  }
}

program
  .name('@confytome/markdown')
  .description('Generate Confluence-friendly Markdown documentation from OpenAPI specifications')
  .version('1.4.4');

program
  .command('generate')
  .description('Generate Markdown documentation from OpenAPI specification')
  .option('-s, --spec <path>', 'path to OpenAPI specification file', './confytome/api-spec.json')
  .option('-o, --output <dir>', 'output directory', './confytome')
  .option('--no-brand', 'exclude branding from output')
  .action(async(options) => {
    try {
      console.log('📝 @confytome/markdown - Standalone Markdown Generator');
      console.log('');

      const outputDir = getOutputDir(options.output);
      const specPath = options.spec;

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${outputDir}`);
      }

      // Check if OpenAPI spec exists
      checkOpenAPISpec(specPath);

      // If spec is not in the output directory, copy it there
      const targetSpecPath = path.join(outputDir, 'api-spec.json');
      if (path.resolve(specPath) !== path.resolve(targetSpecPath)) {
        fs.copyFileSync(specPath, targetSpecPath);
        console.log(`📋 Copied OpenAPI spec to: ${targetSpecPath}`);
      }

      console.log(`📄 Using OpenAPI spec: ${specPath}`);
      console.log(`📁 Output directory: ${outputDir}`);
      console.log('');

      // Create and run generator
      const generator = new StandaloneMarkdownGenerator(outputDir);

      // Initialize generator
      await generator.initialize({
        excludeBrand: !options.brand
      });

      // Generate documentation
      const result = await generator.generate({
        excludeBrand: !options.brand
      });

      if (result.success) {
        console.log('');
        console.log('🎉 Markdown generation completed successfully!');
        console.log(`📄 Generated: ${result.outputPath}`);
        console.log(`📏 File size: ${result.size} bytes`);
        if (result.stats.endpoints) {
          console.log(`🔗 Endpoints: ${result.stats.endpoints}`);
        }
        if (result.stats.resources) {
          console.log(`📚 Resources: ${result.stats.resources}`);
        }
        console.log('');
        console.log('💡 You can now use the generated Markdown in Confluence or other platforms');
      } else {
        console.error('❌ Markdown generation failed');
        if (result.stats?.error) {
          console.error(`   ${result.stats.error}`);
        }
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate OpenAPI specification')
  .option('-s, --spec <path>', 'path to OpenAPI specification file', './confytome/api-spec.json')
  .action((options) => {
    try {
      console.log('🔍 Validating OpenAPI specification...');
      console.log('');

      checkOpenAPISpec(options.spec);

      // Try to parse the JSON
      const content = fs.readFileSync(options.spec, 'utf8');
      const spec = JSON.parse(content);

      // Basic validation
      const errors = [];
      const warnings = [];

      if (!spec.openapi) {
        errors.push('Missing "openapi" version field');
      } else if (!spec.openapi.startsWith('3.')) {
        warnings.push(`OpenAPI version ${spec.openapi} detected, this generator is optimized for 3.x`);
      }

      if (!spec.info) {
        errors.push('Missing "info" object');
      } else {
        if (!spec.info.title) warnings.push('Missing API title in info object');
        if (!spec.info.version) warnings.push('Missing API version in info object');
      }

      if (!spec.paths || Object.keys(spec.paths).length === 0) {
        warnings.push('No API paths found - documentation will be minimal');
      }

      // Show results
      if (errors.length === 0) {
        console.log('✅ OpenAPI specification is valid');
        const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
        const endpointCount = spec.paths ?
          Object.values(spec.paths).reduce((total, pathItem) => {
            return total + Object.keys(pathItem).filter(method =>
              ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)
            ).length;
          }, 0) : 0;

        console.log('📊 Statistics:');
        console.log(`   API Title: ${spec.info?.title || 'Not specified'}`);
        console.log(`   API Version: ${spec.info?.version || 'Not specified'}`);
        console.log(`   OpenAPI Version: ${spec.openapi || 'Not specified'}`);
        console.log(`   Paths: ${pathCount}`);
        console.log(`   Endpoints: ${endpointCount}`);

        if (warnings.length > 0) {
          console.log('');
          console.log('⚠️  Warnings:');
          warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        console.log('');
        console.log('🚀 Ready for Markdown generation!');
      } else {
        console.log('❌ OpenAPI specification has errors:');
        errors.forEach(error => console.log(`   - ${error}`));
        process.exit(1);
      }

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`❌ File not found: ${options.spec}`);
      } else if (error instanceof SyntaxError) {
        console.error('❌ Invalid JSON in OpenAPI specification');
        console.error(`   ${error.message}`);
      } else {
        console.error('❌ Validation failed:', error.message);
      }
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show generator information')
  .action(() => {
    console.log('📦 @confytome/markdown - Standalone Markdown Generator');
    console.log('');
    console.log('Description:');
    console.log('  Generates Confluence-friendly Markdown documentation from OpenAPI specifications');
    console.log('  using Mustache templates. Optimized for API documentation with code samples.');
    console.log('');
    console.log('Features:');
    console.log('  ✅ OpenAPI 3.x support');
    console.log('  ✅ Confluence-friendly formatting');
    console.log('  ✅ Code samples with curl examples');
    console.log('  ✅ Turkish Unicode support');
    console.log('  ✅ Customizable Mustache templates');
    console.log('  ✅ Standalone operation (no core dependency)');
    console.log('');
    console.log('Usage:');
    console.log('  confytome-markdown generate --spec ./api-spec.json --output ./docs');
    console.log('  confytome-markdown validate --spec ./api-spec.json');
    console.log('');
    console.log('Template location: ./templates/main.mustache');
    console.log('');
  });

// If no command provided, show help
if (process.argv.length <= 2) {
  program.help();
}

program.parse();
