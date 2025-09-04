/**
 * Simplified Base Generator Classes
 * 
 * Replaces the complex template pattern in base-generator.js with simple,
 * direct inheritance that focuses only on shared functionality without
 * over-engineering.
 * 
 * Key simplifications:
 * - Removed complex template pattern with multiple phases
 * - Removed CLI argument parsing (handled by orchestrator)
 * - Simplified validation (delegated to FileManager)
 * - Just essential shared functionality
 */

import path from 'path';
import { FileManager } from './file-manager.js';

/**
 * Simple Base Generator
 * 
 * Provides only the essential shared functionality without complex patterns.
 * Much easier to understand and maintain than the previous version.
 */
export class BaseGenerator {
  constructor(name, description, outputDir = './docs') {
    this.name = name;
    this.description = description;
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
   * Get all statistics as object
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
    FileManager.writeFile(filePath, content, this.name, description);
    
    // Add basic stats
    this.addStat('Output file', filePath);
    this.addStat('File size', FileManager.getFileSize(filePath));
  }

  /**
   * Generate method - must be implemented by subclasses
   * This is the only method that subclasses need to implement.
   */
  async generate(...args) {
    throw new Error(`generate() method must be implemented by ${this.name}`);
  }

  /**
   * Get success message - can be overridden by subclasses
   */
  getSuccessMessage() {
    return `${this.description} completed`;
  }

  /**
   * Utility method to check if this module is being run directly
   * @param {string} importMetaUrl - import.meta.url from calling module
   * @returns {boolean} True if this is the main module
   */
  static isMainModule(importMetaUrl) {
    return importMetaUrl === `file://${process.argv[1]}`;
  }

  /**
   * Run generator if this is the main module
   * Simplified version that just shows a helpful message
   * 
   * @param {Class} GeneratorClass - Generator class to run
   * @param {string} importMetaUrl - import.meta.url from calling module
   */
  static runIfMain(GeneratorClass, importMetaUrl) {
    if (this.isMainModule(importMetaUrl)) {
      console.log('⚠️  Direct generator execution is deprecated.');
      console.log('   Use the CLI instead: confytome <command>');
      console.log('   For help: confytome --help');
      process.exit(1);
    }
  }
}

/**
 * OpenAPI Generator Base
 * 
 * Simple base class for generators that create OpenAPI specs from JSDoc files.
 * Only provides the methods that are actually needed.
 */
export class OpenAPIGeneratorBase extends BaseGenerator {
  constructor(name, description, outputDir = './docs') {
    super(name, description, outputDir);
  }

  /**
   * Load server configuration
   * @param {string} configPath - Path to server config file
   * @returns {Object} Server configuration object
   */
  loadServerConfig(configPath) {
    return FileManager.loadServerConfig(configPath, this.name);
  }

  /**
   * Validate OpenAPI generation prerequisites
   * @param {string} configPath - Server config file path
   * @param {Array<string>} jsdocFiles - JSDoc files to validate
   */
  validatePrerequisites(configPath, jsdocFiles) {
    FileManager.validateOpenAPIPrerequisites(
      configPath, 
      jsdocFiles, 
      this.outputDir, 
      this.name
    );
  }
}

/**
 * Spec Consumer Generator Base
 * 
 * Simple base class for generators that consume existing OpenAPI specs.
 * Only provides the methods that are actually needed.
 */
export class SpecConsumerGeneratorBase extends BaseGenerator {
  constructor(name, description, outputDir = './docs') {
    super(name, description, outputDir);
  }

  /**
   * Load existing OpenAPI specification
   * @returns {Object} OpenAPI specification object
   */
  loadOpenAPISpec() {
    const specPath = path.join(this.outputDir, 'api-spec.json');
    return FileManager.readOpenAPISpec(specPath, this.name);
  }

  /**
   * Validate spec consumer prerequisites
   * Ensures OpenAPI spec exists and is valid
   */
  validatePrerequisites() {
    FileManager.validateSpecConsumerPrerequisites(this.outputDir, this.name);
  }
}

export default BaseGenerator;