/**
 * Self-Contained Base for Standalone Generators
 *
 * Provides common functionality without any external dependencies.
 * This ensures true standalone operation for all @confytome generators.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Simple interface for standalone generators
 */
export class StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    this.outputDir = outputDir;
    this.options = {
      excludeBrand: false,
      ...options
    };
  }

  /**
   * Get generator metadata (must be implemented by subclasses)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    throw new Error('getMetadata() must be implemented by subclass');
  }

  /**
   * Validate prerequisites
   * @param {Object} _options - Validation options
   * @returns {Promise<Object>} Validation result
   */
  async validate(_options = {}) {
    const errors = [];
    const warnings = [];

    // Check if output directory can be created/written to
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
        fs.rmSync(this.outputDir, { recursive: true }); // Test cleanup
      } else {
        // Test write permission
        const testFile = path.join(this.outputDir, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
      }
    } catch {
      errors.push(`Cannot write to output directory: ${this.outputDir}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Initialize the generator
   * @param {Object} options - Initialization options
   * @returns {Promise<Object>} Initialization result
   */
  async initialize(options = {}) {
    // Merge options
    this.options = { ...this.options, ...options };

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Load OpenAPI specification
   * @param {string} specPath - Path to OpenAPI spec (optional)
   * @returns {Object} Parsed OpenAPI specification
   */
  loadOpenAPISpec(specPath) {
    const defaultSpecPath = path.join(this.outputDir, 'api-spec.json');
    const finalSpecPath = specPath || defaultSpecPath;

    if (!fs.existsSync(finalSpecPath)) {
      throw new Error(`OpenAPI specification not found: ${finalSpecPath}`);
    }

    try {
      const content = fs.readFileSync(finalSpecPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse OpenAPI specification: ${error.message}`);
    }
  }

  /**
   * Write output file with error handling
   * @param {string} filename - Output filename
   * @param {string} content - File content
   * @param {string} successMessage - Success message to log
   * @returns {Object} Generation result
   */
  writeOutputFile(filename, content, successMessage = 'File generated successfully') {
    try {
      const outputPath = path.isAbsolute(filename) ? filename : path.join(this.outputDir, filename);

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`✅ ${successMessage}: ${outputPath}`);

      const stats = fs.statSync(outputPath);
      return {
        success: true,
        outputPath,
        size: stats.size,
        stats: {
          outputPath,
          fileSize: stats.size
        }
      };
    } catch (error) {
      console.error(`❌ Failed to write file: ${error.message}`);
      return {
        success: false,
        outputPath: null,
        size: 0,
        stats: { error: error.message }
      };
    }
  }

  /**
   * Get base URL from OpenAPI servers array
   * @param {Array} servers - OpenAPI servers array
   * @returns {string} Base URL
   */
  getBaseUrl(servers) {
    if (!servers || !servers.length) return '';
    return servers[servers.length - 1].url;
  }

  /**
   * Generate timestamp for branding
   * @returns {string} ISO timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Create branding text
   * @param {string} _format - Format type ('markdown', 'html', etc.)
   * @returns {string} Branding text
   */
  generateBranding(_format = 'json') {
    if (this.options.excludeBrand) {
      return `Generated ${this.getTimestamp()} UTC`;
    }

    const metadata = this.constructor.getMetadata();
    return `Generated ${this.getTimestamp()} UTC by ${metadata.packageName}`;
  }

  /**
   * Log progress message
   * @param {string} message - Message to log
   * @param {string} level - Log level ('info', 'warn', 'error')
   */
  log(message, level = 'info') {
    const prefix = {
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌ '
    }[level] || '';

    console.log(`${prefix}${message}`);
  }

  /**
   * Validate file exists and is readable
   * @param {string} filePath - Path to validate
   * @param {string} description - Description for error messages
   * @returns {boolean} Whether file is valid
   */
  validateFileExists(filePath, description = 'file') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${description} not found: ${filePath}`);
    }

    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      return true;
    } catch {
      throw new Error(`Cannot read ${description}: ${filePath}`);
    }
  }

  /**
   * Get generator information
   * @returns {Object} Generator metadata
   */
  getInfo() {
    return this.constructor.getMetadata();
  }

  /**
   * Clean up resources (optional)
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Default: no cleanup needed
  }

  /**
   * Generate documentation (must be implemented by subclasses)
   * @param {Object} _options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generate(_options = {}) {
    throw new Error('generate() must be implemented by subclass');
  }
}
