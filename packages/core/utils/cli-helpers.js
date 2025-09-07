/**
 * Registry-based CLI Helper Functions
 *
 * Uses the generator registry system for CLI functions.
 */

import fs from 'fs';
import path from 'path';
import { registryOrchestrator } from '../services/RegistryOrchestrator.js';
import { GeneratorFactory } from '../services/GeneratorFactory.js';
import { getOutputDir, DEFAULT_CONFIG_FILES } from '../constants.js';
import { ConfytomeConfig } from './confytome-config.js';

/**
 * Run generators for OpenAPI generation (requires JSDoc files)
 * @param {string} configPath - Path to server config file
 * @param {Array<string>} files - JSDoc files to process
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateOpenAPI(configPath, files, outputDir) {
  outputDir = getOutputDir(outputDir);
  await GeneratorFactory.initialize();

  // For OpenAPI generation, we need to use the core OpenAPI generator
  const { OpenAPIGenerator } = await import('../generate-openapi.js');
  const generator = new OpenAPIGenerator();

  // Set up environment for the generator
  process.argv = ['node', 'generate-openapi.js', configPath, ...files];
  process.env.OUTPUT_DIR = outputDir;

  // Create args object for the generator
  const args = {
    serverConfigPath: configPath,
    jsdocFiles: files,
    outputDir
  };

  return await generator.generate(args);
}

/**
 * Run all documentation generators (OpenAPI first, then consumers)
 * @param {string} configPath - Path to server config file
 * @param {Array<string>} files - JSDoc files to process
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array<Object>>} Array of generation results
 */
export async function generateAllDocs(configPath, files, outputDir, options = {}) {
  outputDir = getOutputDir(outputDir);
  // First generate OpenAPI spec
  await generateOpenAPI(configPath, files, outputDir);

  // Then run all spec consumer generators
  const results = await registryOrchestrator.executeAllSpecConsumers(outputDir, {
    excludeBrand: options.excludeBrand || false,
    contextUrl: import.meta.url
  });

  return results;
}

/**
 * Run a single spec consumer generator (requires existing OpenAPI spec)
 * @param {string} generatorName - Name of the generator to run
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateFromSpec(generatorName, outputDir) {
  outputDir = getOutputDir(outputDir);
  const result = await registryOrchestrator.executeGenerator(generatorName, outputDir, {
    contextUrl: import.meta.url
  });

  return result;
}

/**
 * Run multiple spec consumer generators (requires existing OpenAPI spec)
 * @param {Array<string>} generatorNames - Names of generators to run
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array<Object>>} Array of generation results
 */
export async function generateMultipleFromSpec(generatorNames, outputDir) {
  outputDir = getOutputDir(outputDir);
  const results = await registryOrchestrator.executeGenerators(generatorNames, outputDir, {
    contextUrl: import.meta.url
  });

  return results;
}

/**
 * Initialize demo project (simplified version of previous init functionality)
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateDemo(outputDir) {
  outputDir = getOutputDir(outputDir);
  // For demo, we need the example files to exist first
  const exampleRouter = './example-router.js';
  const exampleConfig = './serverConfig.json';

  if (fs.existsSync(exampleRouter) && fs.existsSync(exampleConfig)) {
    return await generateAllDocs(exampleConfig, [exampleRouter], outputDir);
  } else {
    throw new Error('Demo files not found. Run "confytome init" first.');
  }
}

/**
 * Get helpful information about generators
 * @param {string} generatorName - Optional specific generator name
 * @returns {Object|Array} Generator information
 */
export async function getGeneratorInfo(generatorName = null) {
  await GeneratorFactory.initialize();

  if (generatorName) {
    return await registryOrchestrator.getGeneratorInfo(generatorName);
  }

  return await registryOrchestrator.listGeneratorsWithStatus();
}

/**
 * Get predefined generator sets for CLI commands
 * @returns {Object} Available generator sets
 */
export async function getGeneratorSets() {
  await GeneratorFactory.initialize();
  return await registryOrchestrator.getGeneratorSets();
}

/**
 * Simple validation helper for CLI arguments
 * @param {Array<string>} generatorNames - Generator names to validate
 * @throws {Error} If validation fails
 */
export async function validateGenerators(generatorNames) {
  await GeneratorFactory.initialize();

  const results = await registryOrchestrator.validateGenerators(generatorNames);
  const invalid = results.filter(r => !r.available);

  if (invalid.length > 0) {
    const errors = invalid.map(r => `${r.name}: ${r.validation.errors.join(', ')}`);
    throw new Error(`Generator validation failed:\\n${errors.join('\\n')}`);
  }
}

/**
 * Generate documentation using confytome.json configuration
 * @param {string} configPath - Path to confytome.json (default: DEFAULT_CONFIG_FILES.CONFYTOME)
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateFromConfytomeConfig(configOrPath = DEFAULT_CONFIG_FILES.CONFYTOME, outputDir, options = {}) {
  outputDir = getOutputDir(outputDir);
  let confytomeConfig;

  // Handle both config objects and file paths for backward compatibility
  if (typeof configOrPath === 'string') {
    confytomeConfig = await ConfytomeConfig.load(configOrPath);
  } else {
    // It's already a config object
    confytomeConfig = configOrPath;
  }

  // Extract route file names from the configuration
  const routeFileNames = ConfytomeConfig.getRouteFileNames(confytomeConfig);

  // Create modified server config with overrides for OpenAPI generation
  const modifiedServerConfig = ConfytomeConfig.createModifiedServerConfig(confytomeConfig);

  // Write the modified server config to a temporary file
  const tempConfigPath = path.join(outputDir, '.confytome-server-config.json');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(tempConfigPath, JSON.stringify(modifiedServerConfig, null, 2));

  try {
    // Use the modified configuration to run all generators
    const result = await generateAllDocs(tempConfigPath, routeFileNames, outputDir, options);

    return result;
  } finally {
    // Clean up temp config file
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  }
}
