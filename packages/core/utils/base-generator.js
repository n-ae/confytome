/**
 * Base Generator Class
 * 
 * Provides a common pattern and shared functionality for all generators
 * to reduce duplication and improve maintainability
 */

import path from 'path';
import { SimpleErrorHandler } from './error-handler-simple.js';
import { FileManager } from './file-manager.js';
import { CliArgsParser } from './cli-args.js';
import { CliValidator } from './cli-validator.js';

export class BaseGenerator {
  constructor(name, description, requiresJSDocFiles = false, outputDir = './docs') {
    this.name = name;
    this.description = description;
    this.requiresJSDocFiles = requiresJSDocFiles;
    this.outputDir = outputDir;
    this.startTime = null;
    this.stats = {};
  }

  /**
   * Main execution method - template pattern
   */
  async run() {
    this.startTime = Date.now();
    console.log(`🔄 ${this.description}...`);
    
    try {
      // Setup phase
      await this.setup();
      
      // Parse arguments
      const args = this.parseArguments();
      
      // Validate dependencies
      await this.validateDependencies(args);
      
      // Generate output
      const result = await this.generate(args);
      
      // Post-process and report success
      await this.postProcess(result);
      
      return result;
    } catch (error) {
      SimpleErrorHandler.handle(error, this.name);
    }
  }

  /**
   * Setup phase - can be overridden by subclasses
   */
  async setup() {
    FileManager.ensureDocsDir(this.outputDir);
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    
    if (this.requiresJSDocFiles) {
      return CliValidator.validateOpenAPIArgs(args, this.name);
    } else {
      CliValidator.validateSpecConsumerArgs(this.name);
      return { args };
    }
  }

  /**
   * Validate dependencies - can be overridden by subclasses
   */
  async validateDependencies(args) {
    // Spec consumers need existing OpenAPI spec
    if (!this.requiresJSDocFiles) {
      FileManager.validateSpecConsumerPrerequisites(this.outputDir, this.name);
    }
  }

  /**
   * Generate method - must be implemented by subclasses
   */
  async generate(args) {
    throw new Error(`generate() method must be implemented by ${this.name}`);
  }

  /**
   * Post-process phase - can be overridden by subclasses
   */
  async postProcess(result) {
    SimpleErrorHandler.logSuccess(this.name, this.getSuccessMessage(), this.startTime, this.stats);
  }

  /**
   * Get success message - can be overridden by subclasses
   */
  getSuccessMessage() {
    return `${this.description} completed`;
  }

  /**
   * Add statistic for reporting
   */
  addStat(key, value) {
    this.stats[key] = value;
  }

  /**
   * Get execution duration
   */
  getDuration() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Check if we're running as main module (ES module equivalent of require.main === module)
   */
  static isMainModule(importMetaUrl) {
    return importMetaUrl === `file://${process.argv[1]}`;
  }

  /**
   * Create and run a generator if it's the main module
   */
  static async runIfMain(GeneratorClass, importMetaUrl, ...args) {
    if (this.isMainModule(importMetaUrl)) {
      const generator = new GeneratorClass(...args);
      await generator.run();
    }
  }
}

/**
 * OpenAPI Generator Base Class
 * For generators that create the OpenAPI spec from JSDoc files
 */
export class OpenAPIGeneratorBase extends BaseGenerator {
  constructor(name, description, outputDir = './docs') {
    super(name, description, true, outputDir); // Requires JSDoc files
  }

  async validateDependencies(args) {
    // Use centralized validation for OpenAPI prerequisites
    FileManager.validateOpenAPIPrerequisites(
      args.serverConfigPath,
      args.jsdocFiles,
      this.outputDir,
      this.name
    );
  }

  /**
   * Load server configuration
   */
  loadServerConfig(configPath) {
    return FileManager.loadServerConfig(configPath, this.name);
  }
}

/**
 * Spec Consumer Generator Base Class  
 * For generators that consume existing OpenAPI spec
 */
export class SpecConsumerGeneratorBase extends BaseGenerator {
  constructor(name, description, outputDir = './docs') {
    super(name, description, false, outputDir); // Doesn't require JSDoc files
  }

  /**
   * Load existing OpenAPI spec
   */
  loadOpenAPISpec() {
    const specPath = path.join(this.outputDir, 'api-spec.json');
    return FileManager.readOpenAPISpec(specPath, this.name);
  }

  /**
   * Write output file with standard handling
   */
  writeOutputFile(filePath, content, description) {
    const result = FileManager.writeFile(filePath, content, this.name, description);
    
    // Add stats
    this.addStat('Output file', filePath);
    this.addStat('File size', FileManager.getFileSize(filePath));
    
    return result;
  }
}

export default BaseGenerator;