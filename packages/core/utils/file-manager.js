/**
 * File Management Utility
 *
 * Centralizes all file operations with consistent error handling
 * and dependency validation for better maintainability
 */

import fs from 'fs';
import path from 'path';
import { SimpleErrorHandler } from './error-handler-simple.js';

export class FileManager {
  /**
   * Ensure the docs directory exists
   * @param {string} docsPath - Path to docs directory (default: './docs')
   */
  static ensureDocsDir(docsPath = './docs') {
    try {
      if (!fs.existsSync(docsPath)) {
        fs.mkdirSync(docsPath, { recursive: true });
        console.log(`📁 Created docs directory: ${docsPath}`);
      }
    } catch (error) {
      SimpleErrorHandler.handle(error, 'FileManager');
    }
  }

  /**
   * Read and validate server configuration
   * @param {string} configPath - Path to server config file
   * @param {string} generator - Generator name for error context
   * @returns {Object} Parsed and validated configuration
   */
  static loadServerConfig(configPath, generator) {
    try {
      console.log(`📁 Server config loaded from: ${configPath}`);

      if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
      }

      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);

      // Basic validation
      this.validateServerConfig(config, configPath, generator);

      return config;
    } catch (error) {
      SimpleErrorHandler.handle(error, generator);
    }
  }

  /**
   * Validate server configuration structure
   * @param {Object} config - Configuration object
   * @param {string} configPath - Path to config file
   * @param {string} generator - Generator name for error context
   */
  static validateServerConfig(config, configPath, generator) {
    const requiredFields = ['info', 'servers'];
    const requiredInfoFields = ['title', 'version'];

    for (const field of requiredFields) {
      if (!config[field]) {
        const error = new Error(`Missing required field: ${field}`);
        SimpleErrorHandler.handle(error, generator);
      }
    }

    if (config.info) {
      for (const field of requiredInfoFields) {
        if (!config.info[field]) {
          const error = new Error(`Missing required info field: ${field}`);
          SimpleErrorHandler.handle(error, generator);
        }
      }
    }

    if (config.servers && !Array.isArray(config.servers)) {
      const error = new Error('Servers must be an array');
      SimpleErrorHandler.handle(error, generator);
    }
  }

  /**
   * Read OpenAPI specification file
   * @param {string} specPath - Path to OpenAPI spec (default: './docs/api-spec.json')
   * @param {string} generator - Generator name for error context
   * @returns {Object} Parsed OpenAPI specification
   */
  static readOpenAPISpec(specPath = './docs/api-spec.json', generator) {
    try {
      console.log('📖 Reading OpenAPI spec...');

      if (!fs.existsSync(specPath)) {
        throw new Error('OpenAPI spec not found. Run OpenAPI generator first.');
      }

      const specContent = fs.readFileSync(specPath, 'utf8');
      const spec = JSON.parse(specContent);

      // Basic validation - support both OpenAPI 3.x and Swagger 2.0
      if ((!spec.openapi && !spec.swagger) || !spec.info || !spec.paths) {
        throw new Error('Invalid OpenAPI/Swagger specification format');
      }

      return spec;
    } catch (error) {
      if (error instanceof SyntaxError) {
        const customError = new Error('Invalid JSON in OpenAPI spec file');
        SimpleErrorHandler.handle(customError, generator);
      } else {
        SimpleErrorHandler.handle(error, generator);
      }
      // This line should never be reached due to handleFileError exiting
      return null;
    }
  }

  /**
   * Validate JSDoc files exist and are readable
   * @param {Array<string>} filePaths - Array of JSDoc file paths
   * @param {string} generator - Generator name for error context
   * @returns {Array<string>} Validated file paths
   */
  static validateJSDocFiles(filePaths, generator) {
    const validFiles = [];
    const missingFiles = [];

    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          // Check if file is readable
          fs.accessSync(filePath, fs.constants.R_OK);
          validFiles.push(filePath);
          console.log(`📄 JSDoc file found: ${filePath}`);
        } else {
          missingFiles.push(filePath);
        }
      } catch (error) {
        SimpleErrorHandler.handle(error, generator);
      }
    }

    if (missingFiles.length > 0) {
      const error = new Error(`JSDoc files not found: ${missingFiles.join(', ')}`);
      throw new FileError(error.message, generator, missingFiles[0], error);
    }

    return validFiles;
  }

  /**
   * Write file with error handling
   * @param {string} filePath - Output file path
   * @param {string} content - File content
   * @param {string} generator - Generator name for error context
   * @param {string} description - Description for success message
   */
  static writeFile(filePath, content, generator, description) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${description}: ${filePath}`);

      return {
        path: filePath,
        size: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      SimpleErrorHandler.handle(error, generator);
    }
  }

  /**
   * Get file size in human-readable format
   * @param {string} filePath - Path to file
   * @returns {string} Human-readable file size
   */
  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;

      if (bytes === 0) return '0 B';

      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Check if file exists and get basic info
   * @param {string} filePath - Path to check
   * @returns {Object|null} File info or null if doesn't exist
   */
  static getFileInfo(filePath) {
    try {
      if (!fs.existsSync(filePath)) return null;

      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: this.getFileSize(filePath),
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate generation prerequisites for spec consumer generators
   * @param {string} outputDir - Output directory path
   * @param {string} _generator - Generator name for error context
   * @throws {Error} If prerequisites are not met
   */
  static validateSpecConsumerPrerequisites(outputDir, _generator) {
    // Ensure output directory exists
    this.ensureDocsDir(outputDir);

    // Check if OpenAPI spec exists
    const specPath = path.join(outputDir, 'api-spec.json');
    if (!fs.existsSync(specPath)) {
      throw new Error('OpenAPI spec not found. Run OpenAPI generator first.');
    }

    // Validate spec is readable and valid JSON
    try {
      const specContent = fs.readFileSync(specPath, 'utf8');
      const spec = JSON.parse(specContent);

      // Basic validation - support both OpenAPI 3.x and Swagger 2.0
      if ((!spec.openapi && !spec.swagger) || !spec.info || !spec.paths) {
        throw new Error('Invalid OpenAPI/Swagger specification format');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('OpenAPI spec contains invalid JSON');
      }
      throw error;
    }
  }

  /**
   * Validate OpenAPI generator prerequisites
   * @param {string} configPath - Server config file path
   * @param {Array<string>} jsdocFiles - JSDoc files to validate
   * @param {string} outputDir - Output directory path
   * @param {string} generator - Generator name for error context
   * @throws {Error} If prerequisites are not met
   */
  static validateOpenAPIPrerequisites(configPath, jsdocFiles, outputDir, generator) {
    // Ensure output directory exists
    this.ensureDocsDir(outputDir);

    // Validate server config
    if (!fs.existsSync(configPath)) {
      throw new Error(`Server config file not found: ${configPath}`);
    }

    // Validate JSDoc files
    this.validateJSDocFiles(jsdocFiles, generator);
  }

  /**
   * Batch file stat operations for performance
   * @param {Array<string>} filePaths - Paths to stat
   * @returns {Array<fs.Stats>} Array of file stats in same order
   */
  static batchStatFiles(filePaths) {
    return filePaths.map(filePath => {
      try {
        return fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      } catch {
        return null;
      }
    });
  }

  /**
   * Clean up old files in docs directory
   * @param {Array<string>} filesToKeep - Files to preserve
   */
  static cleanupDocs(filesToKeep = []) {
    try {
      const docsDir = './docs';
      if (!fs.existsSync(docsDir)) return;

      const files = fs.readdirSync(docsDir);
      let cleaned = 0;

      for (const file of files) {
        if (!filesToKeep.includes(file) && file !== '.gitkeep') {
          const filePath = path.join(docsDir, file);
          const stats = fs.statSync(filePath);

          // Only clean files older than 1 hour
          if (Date.now() - stats.mtime.getTime() > 3600000) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} old files from docs directory`);
      }
    } catch (error) {
      // Don't fail generation for cleanup issues
      console.warn('⚠️  Could not clean docs directory:', error.message);
    }
  }
}

export default FileManager;
