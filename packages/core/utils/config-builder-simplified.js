/**
 * Simplified Configuration Builder
 * 
 * Consolidates the multiple factory methods into a single, flexible approach
 * that reduces duplication while maintaining clarity and ease of use.
 */

import fs from 'fs';
import path from 'path';
import { FileManager } from './file-manager.js';

export class GeneratorConfiguration {
  constructor(configMap) {
    this.serverConfig = configMap.get('serverConfig');
    this.serverConfigPath = configMap.get('serverConfigPath');
    this.jsdocFiles = configMap.get('jsdocFiles') || [];
    this.outputDir = configMap.get('outputDir') || './docs';
    this.watch = configMap.get('watch') || false;
    this.options = configMap.get('options') || {};
    this.requiresJSDocFiles = configMap.get('requiresJSDocFiles') || false;
  }

  /**
   * Validate configuration completeness
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    // Only require server config for OpenAPI generation (when JSDoc files are needed)
    if (this.requiresJSDocFiles && !this.serverConfig && !this.serverConfigPath) {
      errors.push('Server configuration is required');
    }

    if (this.jsdocFiles.length === 0 && this.requiresJSDocFiles) {
      errors.push('At least one JSDoc file is required for OpenAPI generation');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary for logging
   * @returns {Object} Summary object
   */
  getSummary() {
    return {
      serverConfig: this.serverConfigPath || 'inline',
      jsdocFiles: this.jsdocFiles.length,
      outputDir: this.outputDir,
      watch: this.watch
    };
  }
}

export class ConfigurationBuilder {
  constructor() {
    this.config = new Map();
    this.errors = [];
  }

  /**
   * Set server configuration with validation
   * @param {string|Object} config - Path to config file or config object
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withServerConfig(config) {
    if (typeof config === 'string') {
      // It's a file path
      this.config.set('serverConfigPath', config);
      try {
        const loadedConfig = FileManager.loadServerConfig(config, 'ConfigurationBuilder');
        this.config.set('serverConfig', loadedConfig);
      } catch (error) {
        this.errors.push(`Invalid server config: ${error.message}`);
      }
    } else if (typeof config === 'object' && config !== null) {
      // It's a config object
      this.config.set('serverConfig', config);
    } else {
      this.errors.push('Server config must be a file path or object');
    }

    return this;
  }

  /**
   * Set JSDoc files with validation
   * @param {Array<string>} files - Array of JSDoc file paths
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withJSDocFiles(files) {
    if (!Array.isArray(files)) {
      this.errors.push('JSDoc files must be an array');
      return this;
    }

    if (files.length === 0) {
      this.config.set('jsdocFiles', []);
      return this;
    }

    try {
      const validatedFiles = FileManager.validateJSDocFiles(files, 'ConfigurationBuilder');
      this.config.set('jsdocFiles', validatedFiles);
    } catch (error) {
      this.errors.push(`JSDoc file validation failed: ${error.message}`);
    }

    return this;
  }

  /**
   * Set output directory
   * @param {string} dir - Output directory path
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withOutputDir(dir) {
    const outputDir = dir || './docs';
    
    // Ensure directory exists or can be created
    try {
      FileManager.ensureDocsDir(outputDir);
      this.config.set('outputDir', outputDir);
    } catch (error) {
      this.errors.push(`Cannot create output directory: ${error.message}`);
    }

    return this;
  }

  /**
   * Enable watch mode
   * @param {boolean} enabled - Enable watch mode
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withWatch(enabled = true) {
    this.config.set('watch', Boolean(enabled));
    return this;
  }

  /**
   * Set additional options
   * @param {Object} options - Additional options object
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withOptions(options = {}) {
    this.config.set('options', { ...options });
    return this;
  }

  /**
   * Set whether JSDoc files are required for this generator
   * @param {boolean} required - Whether JSDoc files are required
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  withJSDocFilesRequired(required = true) {
    this.config.set('requiresJSDocFiles', Boolean(required));
    return this;
  }

  /**
   * Build and validate the final configuration
   * @returns {GeneratorConfiguration} Validated configuration object
   * @throws {Error} If configuration is invalid
   */
  build() {
    if (this.errors.length > 0) {
      throw new Error(`Configuration build failed:\n${this.errors.map(e => `  - ${e}`).join('\n')}`);
    }

    const configuration = new GeneratorConfiguration(this.config);
    const validation = configuration.validate();

    if (!validation.valid) {
      throw new Error(`Configuration validation failed:\n${validation.errors.map(e => `  - ${e}`).join('\n')}`);
    }

    return configuration;
  }

  /**
   * Check if configuration is valid without building
   * @returns {boolean} True if configuration is valid
   */
  isValid() {
    return this.errors.length === 0;
  }
}

/**
 * Simplified Configuration Factory
 * 
 * Replaces multiple specialized factory methods with a single, flexible factory
 * that accepts configuration type and options. This reduces duplication while
 * maintaining clarity.
 */
export class ConfigurationFactory {
  /**
   * Create configuration for different generator types
   * @param {string} type - Configuration type ('openapi', 'spec-consumer', 'demo')
   * @param {Object} options - Configuration options
   * @returns {GeneratorConfiguration} Configuration object
   */
  static create(type, options = {}) {
    const builder = new ConfigurationBuilder();
    
    switch (type) {
      case 'openapi':
        return this._createOpenAPIConfig(builder, options);
      
      case 'spec-consumer':
        return this._createSpecConsumerConfig(builder, options);
      
      case 'demo':
        return this._createDemoConfig(builder, options);
        
      case 'cli':
        return this._createCLIConfig(builder, options);
      
      default:
        throw new Error(`Unknown configuration type: ${type}. Available: openapi, spec-consumer, demo, cli`);
    }
  }

  /**
   * Create OpenAPI generation configuration
   * @private
   */
  static _createOpenAPIConfig(builder, { configPath, jsdocFiles, outputDir = './docs', watch = false }) {
    if (!configPath) {
      throw new Error('Config path is required for OpenAPI generation');
    }
    if (!jsdocFiles || jsdocFiles.length === 0) {
      throw new Error('JSDoc files are required for OpenAPI generation');
    }

    return builder
      .withServerConfig(configPath)
      .withJSDocFiles(jsdocFiles)
      .withOutputDir(outputDir)
      .withJSDocFilesRequired(true)
      .withWatch(watch)
      .build();
  }

  /**
   * Create spec consumer configuration
   * @private
   */
  static _createSpecConsumerConfig(builder, { outputDir = './docs' }) {
    return builder
      .withOutputDir(outputDir)
      .withJSDocFilesRequired(false)
      .build();
  }

  /**
   * Create demo configuration
   * @private
   */
  static _createDemoConfig(builder, { outputDir = './docs' }) {
    const exampleConfig = './serverConfig.json';
    const exampleRouter = './example-router.js';

    // Validate that example files exist
    if (!fs.existsSync(exampleConfig) || !fs.existsSync(exampleRouter)) {
      throw new Error('Demo files not found. Run confytome init first.');
    }

    return builder
      .withServerConfig(exampleConfig)
      .withJSDocFiles([exampleRouter])
      .withOutputDir(outputDir)
      .withJSDocFilesRequired(true)
      .build();
  }

  /**
   * Create CLI configuration from Commander.js options
   * @private
   */
  static _createCLIConfig(builder, cliOptions) {
    // Validate required CLI options
    if (!cliOptions.config) {
      throw new Error('Config file is required (-c, --config <path>)');
    }
    if (!cliOptions.files || cliOptions.files.length === 0) {
      throw new Error('JSDoc files are required (-f, --files <files...>)');
    }

    return builder
      .withServerConfig(cliOptions.config)
      .withJSDocFiles(cliOptions.files)
      .withJSDocFilesRequired(true)
      .withOutputDir(cliOptions.output || './docs')
      .withWatch(cliOptions.watch || false)
      .build();
  }

  // Backward compatibility methods (these will be deprecated)
  
  /**
   * @deprecated Use ConfigurationFactory.create('openapi', options) instead
   */
  static forOpenAPIGeneration(configPath, jsdocFiles, outputDir = './docs') {
    console.warn('ConfigurationFactory.forOpenAPIGeneration() is deprecated. Use create("openapi", options) instead.');
    return this.create('openapi', { configPath, jsdocFiles, outputDir });
  }

  /**
   * @deprecated Use ConfigurationFactory.create('spec-consumer', options) instead
   */
  static forSpecConsumers(outputDir = './docs') {
    console.warn('ConfigurationFactory.forSpecConsumers() is deprecated. Use create("spec-consumer", options) instead.');
    return this.create('spec-consumer', { outputDir });
  }

  /**
   * @deprecated Use ConfigurationFactory.create('demo', options) instead
   */
  static forDemo(outputDir = './docs') {
    console.warn('ConfigurationFactory.forDemo() is deprecated. Use create("demo", options) instead.');
    return this.create('demo', { outputDir });
  }

  /**
   * @deprecated Use ConfigurationFactory.create('cli', options) instead
   */
  static fromCLIOptions(cliOptions) {
    console.warn('ConfigurationFactory.fromCLIOptions() is deprecated. Use create("cli", options) instead.');
    return this.create('cli', cliOptions);
  }
}