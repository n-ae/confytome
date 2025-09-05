/**
 * Simplified CLI Helper Functions
 * 
 * Replaces the complex plugin system initialization with simple, direct functions.
 * This approach prioritizes clarity and maintainability over abstraction.
 */

import fs from 'fs';
import path from 'path';
import { GeneratorOrchestrator, GENERATOR_SETS } from './generator-orchestrator.js';
import { ConfigurationFactory } from './config-builder-simplified.js';
import { ConfytomeConfig } from './confytome-config.js';

/**
 * Run generators for OpenAPI generation (requires JSDoc files)
 * @param {string} configPath - Path to server config file
 * @param {Array<string>} files - JSDoc files to process
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateOpenAPI(configPath, files, outputDir = './docs') {
  const config = ConfigurationFactory.create('openapi', { configPath, jsdocFiles: files, outputDir });
  return await GeneratorOrchestrator.runSingle('openapi', config);
}

/**
 * Run all documentation generators (OpenAPI first, then consumers)
 * @param {string} configPath - Path to server config file  
 * @param {Array<string>} files - JSDoc files to process
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array<Object>>} Array of generation results
 */
export async function generateAllDocs(configPath, files, outputDir = './docs') {
  const config = ConfigurationFactory.create('openapi', { configPath, jsdocFiles: files, outputDir });
  return await GeneratorOrchestrator.runAll(config);
}

/**
 * Run a single spec consumer generator (requires existing OpenAPI spec)
 * @param {string} generatorName - Name of the generator to run
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateFromSpec(generatorName, outputDir = './docs') {
  const config = ConfigurationFactory.create('spec-consumer', { outputDir });
  return await GeneratorOrchestrator.runSingle(generatorName, config);
}

/**
 * Run multiple spec consumer generators (requires existing OpenAPI spec)
 * @param {Array<string>} generatorNames - Names of generators to run
 * @param {string} outputDir - Output directory
 * @returns {Promise<Array<Object>>} Array of generation results
 */
export async function generateMultipleFromSpec(generatorNames, outputDir = './docs') {
  const config = ConfigurationFactory.create('spec-consumer', { outputDir });
  return await GeneratorOrchestrator.runMultiple(generatorNames, config);
}

/**
 * Initialize demo project (simplified version of previous init functionality)
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateDemo(outputDir = './docs') {
  const config = ConfigurationFactory.create('demo', { outputDir });
  return await GeneratorOrchestrator.runAll(config);
}

/**
 * Get helpful information about generators (replaces complex registry metadata)
 * @param {string} generatorName - Optional specific generator name
 * @returns {Object|Array} Generator information
 */
export function getGeneratorInfo(generatorName = null) {
  if (generatorName) {
    return GeneratorOrchestrator.getGeneratorInfo(generatorName);
  }
  return GeneratorOrchestrator.listGenerators();
}

/**
 * Get predefined generator sets for CLI commands
 * @returns {Object} Available generator sets
 */
export function getGeneratorSets() {
  return GENERATOR_SETS;
}

/**
 * Simple validation helper for CLI arguments
 * @param {Array<string>} generatorNames - Generator names to validate
 * @throws {Error} If validation fails
 */
export function validateGenerators(generatorNames) {
  GeneratorOrchestrator.validateGeneratorNames(generatorNames);
}

// Server overrides now handled directly via JSDoc @swagger servers: field
// Pure OpenAPI standards - no custom processing needed!

/**
 * Generate documentation using confytome.json configuration
 * @param {string} configPath - Path to confytome.json (default: './confytome.json')
 * @param {string} outputDir - Output directory
 * @returns {Promise<Object>} Generation result
 */
export async function generateFromConfytomeConfig(configPath = './confytome.json', outputDir = './docs') {
  const confytomeConfig = await ConfytomeConfig.load(configPath);
  
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
    const result = await generateAllDocs(tempConfigPath, routeFileNames, outputDir);
    
    // Server overrides are now handled directly via JSDoc @swagger servers: field
    // No post-processing needed - pure OpenAPI standards!
    
    return result;
  } finally {
    // Clean up temp config file
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  }
}