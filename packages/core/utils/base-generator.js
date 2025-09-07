/**
 * Base Generator Class
 *
 * Provides a common pattern and shared functionality for all generators
 * to reduce duplication and improve maintainability
 */

import fs from 'node:fs';
import path from 'node:path';
import { SimpleErrorHandler } from './error-handler-simple.js';
import { FileManager } from './file-manager.js';
import { CliValidator } from './cli-validator.js';
import { ServiceFactory } from '../services/ServiceFactory.js';
import { getOutputDir, OUTPUT_FILES } from '../constants.js';

export class BaseGenerator {
  constructor(name, description, requiresJSDocFiles = false, outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    this.name = name;
    this.description = description;
    this.requiresJSDocFiles = requiresJSDocFiles;
    this.outputDir = outputDir;
    this.startTime = null;
    this.stats = {};

    // Dependency injection - services can be injected or created automatically
    this.services = services;
  }

  /**
   * Get or create services for this generator
   * @param {string} contextUrl - import.meta.url from the generator
   * @param {string} generatorType - Type of generator
   * @param {Object} options - Generator options
   * @returns {Object} Service container
   */
  getServices(contextUrl, generatorType = null, options = {}) {
    if (!this.services) {
      // Auto-create services if not injected
      const opts = {
        excludeBrand: this.excludeBrand || false,
        ...options
      };

      this.services = generatorType
        ? ServiceFactory.createGeneratorServices(contextUrl, generatorType, opts)
        : ServiceFactory.createServices(contextUrl, opts);
    }

    return this.services;
  }

  /**
   * Initialize services for this generator
   * @param {string} contextUrl - import.meta.url from the generator
   * @param {string} generatorType - Type of generator
   */
  initializeServices(contextUrl, generatorType = null) {
    const options = {
      excludeBrand: this.excludeBrand || false
    };

    this.services = generatorType
      ? ServiceFactory.createGeneratorServices(contextUrl, generatorType, options)
      : ServiceFactory.createServices(contextUrl, options);
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
  async validateDependencies(_args) {
    // Spec consumers need existing OpenAPI spec
    if (!this.requiresJSDocFiles) {
      FileManager.validateSpecConsumerPrerequisites(this.outputDir, this.name);
    }
  }

  /**
   * Generate method - must be implemented by subclasses
   */
  async generate(_args) {
    throw new Error(`generate() method must be implemented by ${this.name}`);
  }

  /**
   * Post-process phase - can be overridden by subclasses
   */
  async postProcess(_result) {
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
  constructor(name, description, outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super(name, description, true, outputDir, services); // Requires JSDoc files
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
  constructor(name, description, outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super(name, description, false, outputDir, services); // Doesn't require JSDoc files
  }

  /**
   * Load existing OpenAPI spec
   */
  loadOpenAPISpec() {
    const specPath = path.join(this.outputDir, OUTPUT_FILES.OPENAPI_SPEC);
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

  /**
   * Template method for standard document generation workflow
   * Eliminates code duplication across all generators
   */
  async generateDocument(generatorType, outputFileName, generateContent) {
    // Initialize services if not injected
    const services = this.getServices(import.meta.url, generatorType);

    // Load OpenAPI spec
    const openApiSpec = this.loadOpenAPISpec();

    // Generate content using provided function
    const content = await generateContent(openApiSpec, services);

    // Write output file
    const outputPath = path.join(this.outputDir, outputFileName);
    this.writeOutputFile(outputPath, content, `${generatorType} documentation created`);

    // Calculate stats
    this.calculateDocumentStats(openApiSpec, outputPath);

    return {
      outputPath,
      size: Buffer.byteLength(content, 'utf8')
    };
  }

  /**
   * Template method for external tool-based generation workflow
   * For generators that use external tools like widdershins
   */
  async generateWithExternalTool(generatorType, outputFileName, toolProcess, _description) {
    // Initialize services if not injected
    const services = this.getServices(import.meta.url, generatorType);

    // Load OpenAPI spec
    const openApiSpec = this.loadOpenAPISpec();

    // Run external tool process
    const outputPath = path.join(this.outputDir, outputFileName);
    await toolProcess(openApiSpec, services, outputPath);

    // Calculate stats
    this.calculateDocumentStats(openApiSpec, outputPath);

    return {
      outputPath,
      size: fs.statSync(outputPath).size
    };
  }

  /**
   * Standard stats calculation for document generators
   * Override in subclasses if needed
   */
  calculateDocumentStats(openApiSpec, outputPath) {
    const specStats = fs.statSync(path.join(this.outputDir, OUTPUT_FILES.OPENAPI_SPEC));
    const outputStats = fs.statSync(outputPath);

    this.addStat('OpenAPI spec', `${(specStats.size / 1024).toFixed(1)} KB`);
    this.addStat('Generated output', `${(outputStats.size / 1024).toFixed(1)} KB`);

    // Count paths and endpoints
    const pathCount = Object.keys(openApiSpec.paths || {}).length;
    const endpointCount = Object.values(openApiSpec.paths || {})
      .reduce((acc, methods) => acc + Object.keys(methods).length, 0);

    this.addStat('Unique paths', `${pathCount}`);
    this.addStat('Total endpoints', `${endpointCount}`);
  }
}

