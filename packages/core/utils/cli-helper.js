/**
 * Shared CLI utilities using strategy pattern
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ConfigMerger } from './config-merger.js';

export class SpecResolver {
  constructor(packageName) {
    this.packageName = packageName;
  }

  async resolveSpec(options, config) {
    let specPath;
    let needsGeneration = false;

    if (options.spec) {
      specPath = path.resolve(options.spec);
      if (!fs.existsSync(specPath)) {
        throw new Error(`Specified OpenAPI spec file not found: ${specPath}`);
      }
      console.log(`📋 Using provided OpenAPI spec: ${specPath}`);
    } else {
      const outputDir = config.outputDir || options.output;
      specPath = config.specPath || path.join(outputDir, 'api-spec.json');
      needsGeneration = !fs.existsSync(specPath);
    }

    if (needsGeneration) {
      await this.generateSpec(options, config);
    } else if (!options.spec) {
      console.log(`📋 Using existing OpenAPI spec: ${specPath}`);
    }

    return specPath;
  }

  async generateSpec(options, config) {
    console.log('📋 OpenAPI spec not found, generating it first...');
    console.log('   This requires @confytome/core to generate the spec from your API code.');

    this.checkCoreAvailability();

    if (!config.serverConfig || !config.routeFiles) {
      console.error('❌ Error: Invalid configuration format.');
      console.log('   Use one of these approaches:');
      console.log('   1. Run "confytome init" to create confytome.json');
      console.log('   2. Ensure your config has serverConfig and routeFiles');
      console.log(`   3. Use existing spec: npx @confytome/${this.packageName} --spec path/to/spec.json`);
      process.exit(1);
    }

    const confytomeCmd = `npx @confytome/core generate --config ${config.configPath || options.config}`;
    console.log(`   Running: ${confytomeCmd}`);

    try {
      execSync(confytomeCmd, { stdio: 'inherit' });
      console.log('✅ OpenAPI spec generated successfully');
      console.log('');
    } catch {
      console.error('❌ Error: Failed to generate OpenAPI spec');
      console.log('💡 Make sure your configuration has valid serverConfig and routeFiles');
      process.exit(1);
    }
  }

  checkCoreAvailability() {
    try {
      execSync('npx @confytome/core --version', { stdio: 'ignore' });
    } catch {
      console.error('❌ Error: @confytome/core is required to generate OpenAPI specs from your API code.');
      console.log('');
      console.log('💡 You have two options:');
      console.log('   1. Install @confytome/core: npm install -g @confytome/core');
      console.log(`   2. Provide existing OpenAPI spec: npx @confytome/${this.packageName} --spec path/to/your-spec.json`);
      process.exit(1);
    }
  }

  copyExternalSpec(specPath, outputDir) {
    const targetSpecPath = path.join(outputDir, 'api-spec.json');
    if (!fs.existsSync(path.dirname(targetSpecPath))) {
      fs.mkdirSync(path.dirname(targetSpecPath), { recursive: true });
    }
    fs.copyFileSync(specPath, targetSpecPath);
  }
}

export function createCLI(packageName, GeneratorClass, description) {
  return async function(program, pkg) {
    console.log(`🚀 @confytome/${packageName} v${pkg.version}`);
    console.log('');

    const options = program.opts();
    let tempConfig = null;

    try {
      // Extract and merge CLI options with config file
      const cliOptions = ConfigMerger.extractCliOptions(options);
      const configPath = options.config || './confytome.json';
      const outputDir = options.output || './docs';

      tempConfig = await ConfigMerger.mergeWithConfig(configPath, cliOptions, outputDir);

      // Load the unified configuration
      const unifiedConfig = fs.readFileSync(tempConfig.configPath, 'utf8');
      const config = JSON.parse(unifiedConfig);

      const resolver = new SpecResolver(packageName);
      const specPath = await resolver.resolveSpec(options, config);

      if (options.spec) {
        resolver.copyExternalSpec(specPath, config.outputDir || outputDir);
      }

      console.log(`🎨 ${description}...`);
      const generator = new GeneratorClass(config.outputDir || outputDir);
      generator.excludeBrand = config.excludeBrand;

      if (options.spec) {
        generator.specPath = options.spec;
      }

      const result = await generator.generate();
      console.log('');
      console.log('✅ Generation completed!');

      if (result.outputPath) {
        console.log(`📄 Generated: ${result.outputPath}`);
        if (packageName === 'html' || packageName === 'swagger') {
          console.log(`🌐 Open in browser: file://${path.resolve(result.outputPath)}`);
        }
      }

      if (result.collectionPath && result.environmentPath) {
        console.log(`📄 Collection: ${result.collectionPath}`);
        console.log(`🌍 Environment: ${result.environmentPath}`);
        console.log(`📊 Generated ${result.requestCount} API requests`);
        console.log('📖 Import both files into Postman to start testing your API!');
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.message.includes('widdershins')) {
        console.log('💡 widdershins will be installed automatically via npx');
      }
      process.exit(1);
    } finally {
      // Clean up temporary config if created
      if (tempConfig) {
        ConfigMerger.cleanup(tempConfig.configPath, tempConfig.isTemporary);
      }
    }
  };
}
