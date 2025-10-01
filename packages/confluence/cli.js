#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { StandaloneConfluenceGenerator } from './standalone-generator.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

async function generateOpenApiSpec(configPath, files, outputDir) {
  return new Promise((resolve, reject) => {
    const absoluteOutputDir = path.resolve(outputDir);
    const specPath = path.join(absoluteOutputDir, 'api-spec.json');

    if (!fs.existsSync(absoluteOutputDir)) {
      fs.mkdirSync(absoluteOutputDir, { recursive: true });
    }

    let args;

    if (configPath && fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.serverConfig && config.routeFiles) {
          args = ['generate', '--config', configPath, '--output', absoluteOutputDir];
          console.log(`📖 Running: npx @confytome/core ${args.join(' ')}`);
        } else {
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
  .name('@confytome/confluence')
  .description('Generate Pandoc-style Markdown for Confluence from OpenAPI specs')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate Confluence-ready Markdown from OpenAPI spec')
  .option('-s, --spec <path>', 'Path to OpenAPI spec file', './api-spec.json')
  .option('-c, --config <path>', 'Server config JSON file (for generating spec from JSDoc)')
  .option('-f, --files <files...>', 'JSDoc files to process (will generate OpenAPI spec if no --spec provided)')
  .option('-o, --output <path>', 'Output directory for generated files', './confytome')
  .option('--no-brand', 'Exclude confytome branding from generated documentation')
  .option('--no-url-encode', 'Disable URL encoding for anchor links (preserve original anchor format)')
  .option('--no-clipboard', 'Skip copying markdown to clipboard')
  .action(async(options) => {
    try {
      let specPath = options.spec;

      if (!fs.existsSync(specPath) && options.config) {
        console.log('🔧 No OpenAPI spec found, generating from JSDoc files...');
        specPath = await generateOpenApiSpec(options.config, options.files, options.output);
      }

      const generator = new StandaloneConfluenceGenerator(options.output, {
        specPath: path.resolve(specPath),
        excludeBrand: !options.brand,
        urlEncodeAnchors: options.urlEncode !== false
      });

      const result = await generator.generate({
        copyToClipboard: options.clipboard !== false
      });

      if (result.success) {
        console.log('✅ Confluence Markdown generation completed successfully');
        console.log(`📄 Generated: ${result.outputPath}`);
        if (result.clipboardSuccess) {
          console.log('📋 Markdown copied to clipboard');
        }
      } else {
        console.error(`❌ Generation failed: ${result.error || 'Unknown error'}`);
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
      const generator = new StandaloneConfluenceGenerator('./', {
        specPath: path.resolve(options.spec)
      });

      const result = await generator.validate();
      if (result.success) {
        console.log('✅ OpenAPI specification is valid');
        console.log('✅ Ready for Confluence Markdown generation');
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
    const metadata = StandaloneConfluenceGenerator.getMetadata();
    console.log(`${metadata.packageName || '@confytome/confluence'}`);
    console.log('Standalone Confluence Generator');
    console.log(`${metadata.description || 'Pandoc-style Markdown generator for Confluence'}`);
    console.log('OpenAPI 3.x support');
    console.log('Clipboard integration');
    console.log(`Version: ${pkg.version}`);
  });

program.parse();
