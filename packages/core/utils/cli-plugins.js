/**
 * CLI Plugin Management Commands
 *
 * Provides commands for managing the generator plugin system
 */

import { GeneratorFactory } from '../services/GeneratorFactory.js';
import { registryOrchestrator } from '../services/RegistryOrchestrator.js';
import { SimpleErrorHandler } from './error-handler-simple.js';
import { DEFAULT_OUTPUT_DIR } from '../constants.js';

/**
 * List all available generators
 */
export async function listGenerators(options = {}) {
  const errorHandler = new SimpleErrorHandler('list-generators');

  try {
    await GeneratorFactory.initialize();
    const generators = await registryOrchestrator.listGeneratorsWithStatus();

    if (options.json) {
      console.log(JSON.stringify(generators, null, 2));
      return;
    }

    console.log('🔌 Available Generators:');
    console.log('');

    if (generators.length === 0) {
      console.log('   No generators found. Run "confytome init" to set up the workspace.');
      return;
    }

    // Group by type
    const byType = {};
    generators.forEach(gen => {
      if (!byType[gen.type]) byType[gen.type] = [];
      byType[gen.type].push(gen);
    });

    for (const [type, typeGenerators] of Object.entries(byType)) {
      console.log(`📦 ${type.toUpperCase()} Generators:`);

      typeGenerators.forEach(gen => {
        const status = gen.available ? '✅' : gen.compatible ? '⚠️ ' : '❌';
        const external = gen.isExternal ? ' (external)' : '';

        console.log(`   ${status} ${gen.name}${external}`);
        console.log(`      ${gen.description}`);
        console.log(`      Version: ${gen.version}, Package: ${gen.packageName}`);

        if (!gen.available && gen.errors.length > 0) {
          console.log(`      Issues: ${gen.errors.join(', ')}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    errorHandler.handleError(error);
  }
}

/**
 * Show detailed information about a specific generator
 */
export async function showGeneratorInfo(generatorName, options = {}) {
  const errorHandler = new SimpleErrorHandler('generator-info');

  try {
    await GeneratorFactory.initialize();
    const info = await registryOrchestrator.getGeneratorInfo(generatorName);

    if (!info.metadata) {
      console.error(`❌ Generator not found: ${generatorName}`);
      console.log('');
      console.log('Available generators:');
      const generators = await GeneratorFactory.listGenerators();
      generators.forEach(gen => console.log(`   ${gen.name}`));
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify(info, null, 2));
      return;
    }

    const meta = info.metadata;
    console.log(`📦 Generator: ${meta.name}`);
    console.log('');
    console.log(`   Description: ${meta.description}`);
    console.log(`   Type: ${meta.type}`);
    console.log(`   Version: ${meta.version}`);
    console.log(`   Package: ${meta.packageName}`);
    console.log(`   JSDoc Required: ${meta.requiresJSDocFiles ? 'Yes' : 'No'}`);
    console.log(`   External Plugin: ${meta.isExternalPlugin ? 'Yes' : 'No'}`);

    if (meta.filePath) {
      console.log(`   File Path: ${meta.filePath}`);
    }

    console.log('');
    console.log(`   Status: ${info.validation.valid ? '✅ Available' : '❌ Unavailable'}`);

    if (!info.validation.valid) {
      console.log('   Issues:');
      info.validation.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    // Show dependencies
    const deps = Object.keys(meta.dependencies);
    const peerDeps = Object.keys(meta.peerDependencies);

    if (deps.length > 0) {
      console.log('');
      console.log('   Dependencies:');
      deps.forEach(dep => console.log(`   - ${dep}: ${meta.dependencies[dep]}`));
    }

    if (peerDeps.length > 0) {
      console.log('');
      console.log('   Peer Dependencies:');
      peerDeps.forEach(dep => console.log(`   - ${dep}: ${meta.peerDependencies[dep]}`));
    }

  } catch (error) {
    errorHandler.handleError(error);
  }
}

/**
 * Show recommended generators based on available dependencies
 */
export async function showRecommendedGenerators(options = {}) {
  const errorHandler = new SimpleErrorHandler('recommended-generators');

  try {
    await GeneratorFactory.initialize();
    const recommended = await GeneratorFactory.getRecommendedGenerators();

    if (options.json) {
      console.log(JSON.stringify(recommended, null, 2));
      return;
    }

    console.log('💡 Recommended Generators:');
    console.log('');

    if (recommended.length === 0) {
      console.log('   No recommended generators available.');
      console.log('   Try running "confytome init" to set up the workspace.');
      return;
    }

    recommended.forEach(gen => {
      console.log(`✅ ${gen.name}`);
      console.log(`   ${gen.description}`);
      console.log(`   Reason: ${gen.reason}`);
      console.log('');
    });

  } catch (error) {
    errorHandler.handleError(error);
  }
}

/**
 * Validate generators and their dependencies
 */
export async function validateGenerators(generatorNames, options = {}) {
  const errorHandler = new SimpleErrorHandler('validate-generators');

  try {
    await GeneratorFactory.initialize();

    let generators = generatorNames;
    if (generators.length === 0) {
      // Validate all generators if none specified
      const allGens = await GeneratorFactory.listGenerators();
      generators = allGens.map(gen => gen.name);
    }

    const results = await registryOrchestrator.validateGenerators(generators);

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log('🔍 Generator Validation Results:');
    console.log('');

    let allValid = true;
    results.forEach(result => {
      const status = result.available ? '✅' : '❌';
      console.log(`${status} ${result.name}`);

      if (!result.available) {
        allValid = false;
        result.validation.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
      console.log('');
    });

    if (allValid) {
      console.log('🎉 All generators are valid and ready to use!');
    } else {
      console.log('⚠️  Some generators have issues. Install missing dependencies to resolve them.');
      process.exit(1);
    }

  } catch (error) {
    errorHandler.handleError(error);
  }
}

/**
 * Execute specific generators using the registry system
 */
export async function executeGenerators(generatorNames, options = {}) {
  const errorHandler = new SimpleErrorHandler('execute-generators');

  try {
    await GeneratorFactory.initialize();

    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const executionOptions = {
      failFast: options.failFast || false,
      excludeBrand: options.excludeBrand || false,
      contextUrl: import.meta.url
    };

    console.log(`🔄 Executing generators: ${generatorNames.join(', ')}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('');

    const results = await registryOrchestrator.executeGenerators(
      generatorNames,
      outputDir,
      executionOptions
    );

    let successCount = 0;
    let failCount = 0;

    results.forEach(result => {
      if (result.success) {
        successCount++;
        console.log(`✅ ${result.generatorName}: ${result.result?.outputPath || 'completed'}`);
      } else {
        failCount++;
        console.log(`❌ ${result.generatorName}: ${result.error}`);
      }
    });

    console.log('');
    console.log(`📊 Results: ${successCount} succeeded, ${failCount} failed`);

    if (failCount > 0) {
      process.exit(1);
    }

  } catch (error) {
    errorHandler.handleError(error);
  }
}

/**
 * Execute all spec consumer generators
 */
export async function executeAllSpecConsumers(options = {}) {
  const errorHandler = new SimpleErrorHandler('execute-all-spec-consumers');

  try {
    await GeneratorFactory.initialize();

    const specConsumers = await registryOrchestrator.getSpecConsumerGenerators();
    const generatorNames = specConsumers.map(gen => gen.name);

    if (generatorNames.length === 0) {
      console.log('❌ No spec consumer generators found.');
      console.log('   Try running "confytome init" first.');
      return;
    }

    console.log(`🔄 Executing all spec consumer generators: ${generatorNames.join(', ')}`);

    await executeGenerators(generatorNames, options);

  } catch (error) {
    errorHandler.handleError(error);
  }
}
