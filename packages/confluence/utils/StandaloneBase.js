/**
 * Self-Contained Base for Standalone Confluence Generator
 *
 * Provides common functionality without any external dependencies.
 * This ensures true standalone operation for @confytome/confluence.
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
      pagePrefix: '',
      spaceKey: '',
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
    } catch (error) {
      errors.push(`Cannot write to output directory: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Initialize the generator
   * @param {Object} _options - Initialization options
   * @returns {Promise<Object>} Initialization result
   */
  async initialize(_options = {}) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    return { success: true };
  }

  /**
   * Validate file exists
   * @param {string} filePath - Path to file
   * @param {string} description - Description for error messages
   */
  validateFileExists(filePath, description = 'File') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${description} not found: ${filePath}`);
    }
  }

  /**
   * Load and parse OpenAPI specification
   * @param {string} specPath - Path to OpenAPI spec file
   * @returns {Object} Parsed OpenAPI specification
   */
  loadOpenAPISpec(specPath) {
    if (!specPath) {
      throw new Error('OpenAPI spec path is required');
    }

    this.validateFileExists(specPath, 'OpenAPI specification');

    try {
      const specContent = fs.readFileSync(specPath, 'utf8');
      const spec = JSON.parse(specContent);

      // Basic validation
      if (!spec.openapi || !spec.info || !spec.paths) {
        throw new Error('Invalid OpenAPI specification format');
      }

      return spec;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in OpenAPI spec: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Write file with error handling
   * @param {string} filePath - Output file path
   * @param {string} content - File content
   * @param {string} description - Description for log messages
   * @returns {Object} File info
   */
  writeFile(filePath, content, description = 'File') {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf8');
      const size = Buffer.byteLength(content, 'utf8');

      this.log(`✅ ${description} created: ${filePath} (${size} bytes)`);

      return { path: filePath, size };
    } catch (error) {
      throw new Error(`Failed to write ${description.toLowerCase()}: ${error.message}`);
    }
  }

  /**
   * Simple logging method
   * @param {string} message - Log message
   */
  log(message) {
    console.log(message);
  }
}
