/**
 * Registry-based CLI Helper Functions
 *
 * Uses the generator registry system for CLI functions.
 */

import fs from 'fs';
import path from 'path';
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
  const allGenerators = await GeneratorFactory.listGenerators();
  const specConsumers = allGenerators.filter(gen => gen.type === 'spec-consumer');
  const generatorNames = specConsumers.map(gen => gen.name);
  const results = await GeneratorFactory.executeGenerators(generatorNames, outputDir, {
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
  const result = await GeneratorFactory.executeGenerator(generatorName, outputDir, {
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
  const results = await GeneratorFactory.executeGenerators(generatorNames, outputDir, {
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

// CLI display functions moved to cli-plugins.js for consolidated CLI functionality

/**
 * Generate documentation using confytome.json configuration
 * @param {string} configPath - Path to confytome.json (default: DEFAULT_CONFIG_FILES.CONFYTOME)
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
/**
 * Helper to create temporary config file
 */
function createTempConfig(outputDir, config) {
  const tempConfigPath = path.join(outputDir, '.confytome-server-config.json');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
  return tempConfigPath;
}

/**
 * Helper to clean up temporary config file
 */
function cleanupTempConfig(tempConfigPath) {
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}

export async function generateFromConfytomeConfig(configPath = DEFAULT_CONFIG_FILES.CONFYTOME, outputDir, options = {}) {
  outputDir = getOutputDir(outputDir);

  const confytomeConfig = await ConfytomeConfig.load(configPath);

  const routeFileNames = ConfytomeConfig.getRouteFileNames(confytomeConfig);
  const modifiedServerConfig = ConfytomeConfig.createModifiedServerConfig(confytomeConfig);
  const tempConfigPath = createTempConfig(outputDir, modifiedServerConfig);

  try {
    return await generateAllDocs(tempConfigPath, routeFileNames, outputDir, options);
  } finally {
    cleanupTempConfig(tempConfigPath);
  }
}
