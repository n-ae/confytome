/**
 * Simplified Generator Base Classes
 * 
 * Eliminates complex template pattern and inheritance in favor of simple, 
 * direct classes that are easy to understand and maintain.
 * 
 * Key simplifications:
 * - No complex template pattern with multiple phases
 * - No CLI argument parsing (handled by orchestrator)
 * - No complex validation chain (handled by file-manager)
 * - Just the essential functionality needed by generators
 */

import path from 'path';
import { FileManager } from './file-manager.js';

/**
 * Base Generator - Minimal shared functionality
 * 
 * This provides only the essential shared methods that generators actually need.
 * No complex template pattern or inheritance chains.
 */
export class GeneratorBase {
  constructor(outputDir = './docs') {
    this.outputDir = outputDir;
    this.stats = new Map();
  }

  /**
   * Add a statistic for reporting
   * @param {string} key - Statistic key
   * @param {string} value - Statistic value
   */
  addStat(key, value) {
    this.stats.set(key, value);
  }

  /**
   * Get all statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return Object.fromEntries(this.stats);
  }

  /**
   * Write output file with consistent handling
   * @param {string} filePath - Output file path
   * @param {string} content - File content
   * @param {string} description - Description for logging
   */
  writeOutputFile(filePath, content, description) {
    FileManager.writeFile(filePath, content, this.constructor.name, description);
    
    // Add stats
    this.addStat('Output file', filePath);
    this.addStat('File size', FileManager.getFileSize(filePath));
  }
}

/**
 * OpenAPI Generator - For generators that create OpenAPI specs
 * 
 * Simplified version that only provides the essential methods needed
 * by generators that create OpenAPI specifications from JSDoc.
 */
export class OpenAPIGenerator extends GeneratorBase {
  constructor(outputDir = './docs') {
    super(outputDir);
  }

  /**
   * Load server configuration
   * @param {string} configPath - Path to server config file
   * @returns {Object} Server configuration
   */
  loadServerConfig(configPath) {
    return FileManager.loadServerConfig(configPath, this.constructor.name);
  }

  /**
   * Validate OpenAPI generation prerequisites
   * @param {string} configPath - Server config file path
   * @param {Array<string>} jsdocFiles - JSDoc files
   */
  validatePrerequisites(configPath, jsdocFiles) {
    FileManager.validateOpenAPIPrerequisites(
      configPath,
      jsdocFiles,
      this.outputDir,
      this.constructor.name
    );
  }

  /**
   * Generate method - must be implemented by subclasses
   * @param {Object} config - Configuration object
   * @returns {Promise<Object>} Generation result
   */
  async generate(config) {
    throw new Error(`generate() method must be implemented by ${this.constructor.name}`);
  }
}

/**
 * Spec Consumer Generator - For generators that consume OpenAPI specs
 * 
 * Simplified version that only provides the essential methods needed
 * by generators that consume existing OpenAPI specifications.
 */
export class SpecConsumerGenerator extends GeneratorBase {
  constructor(outputDir = './docs') {
    super(outputDir);
  }

  /**
   * Load existing OpenAPI specification
   * @returns {Object} OpenAPI specification
   */
  loadOpenAPISpec() {
    const specPath = path.join(this.outputDir, 'api-spec.json');
    return FileManager.readOpenAPISpec(specPath, this.constructor.name);
  }

  /**
   * Validate spec consumer prerequisites
   */
  validatePrerequisites() {
    FileManager.validateSpecConsumerPrerequisites(this.outputDir, this.constructor.name);
  }

  /**
   * Generate method - must be implemented by subclasses
   * @returns {Promise<Object>} Generation result
   */
  async generate() {
    throw new Error(`generate() method must be implemented by ${this.constructor.name}`);
  }
}

/**
 * Utility function to run a generator if it's the main module
 * Simplified version without complex argument parsing
 * 
 * @param {Class} GeneratorClass - Generator class to run
 * @param {string} importMetaUrl - import.meta.url from calling module
 * @param {...any} args - Arguments to pass to generator constructor
 */
export function runIfMain(GeneratorClass, importMetaUrl, ...args) {
  // Check if this module is being run directly
  const isMain = importMetaUrl === `file://${process.argv[1]}`;
  
  if (isMain) {
    console.log('⚠️  Direct generator execution is deprecated.');
    console.log('   Use the CLI instead: confytome <command>');
    console.log('   For help: confytome --help');
    process.exit(1);
  }
}

export default GeneratorBase;