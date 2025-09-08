/**
 * File Management Utility
 *
 * Centralizes all file operations with consistent error handling
 * and dependency validation for better maintainability
 */

import fs from 'fs';
import path from 'path';
import { SimpleErrorHandler } from './error-handler-simple.js';
import { OUTPUT_FILES, DEFAULT_OUTPUT_DIR } from '../constants.js';

export class FileManager {
  /**
   * Ensure the docs directory exists
   * @param {string} docsPath - Path to docs directory (default: DEFAULT_OUTPUT_DIR)
   */
  static ensureDocsDir(docsPath = DEFAULT_OUTPUT_DIR) {
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
   * @param {string} specPath - Path to OpenAPI spec
   * @param {string} generator - Generator name for error context
   * @returns {Object} Parsed OpenAPI specification
   */
  static readOpenAPISpec(specPath, generator) {
    if (!specPath) {
      throw new Error('OpenAPI spec path is required');
    }
    try {
      console.log('📖 Reading OpenAPI spec...');

      if (!fs.existsSync(specPath)) {
        throw new Error('OpenAPI spec not found. Run OpenAPI generator first.');
      }

      const specContent = fs.readFileSync(specPath, 'utf8');
      const spec = JSON.parse(specContent);

      // Basic validation - OpenAPI 3.x only
      if (!spec.openapi || !spec.info || !spec.paths) {
        throw new Error('Invalid OpenAPI specification format');
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
    const { validFiles, missingFiles } = filePaths.reduce((acc, filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.accessSync(filePath, fs.constants.R_OK);
          acc.validFiles.push(filePath);
          console.log(`📄 JSDoc file found: ${filePath}`);
        } else {
          acc.missingFiles.push(filePath);
        }
      } catch (error) {
        SimpleErrorHandler.handle(error, generator);
      }
      return acc;
    }, { validFiles: [], missingFiles: [] });

    if (missingFiles.length > 0) {
      SimpleErrorHandler.handle(new Error(`JSDoc files not found: ${missingFiles.join(', ')}`), generator);
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

  // validateSpecConsumerPrerequisites consolidated into validateGeneratorPrerequisites

  /**
   * Validate generator prerequisites (consolidated method)
   * @param {Object} options - Validation options
   * @param {string} options.outputDir - Output directory path
   * @param {string} options.configPath - Server config file path (for OpenAPI generators)
   * @param {Array<string>} options.jsdocFiles - JSDoc files (for OpenAPI generators)
   * @param {boolean} options.requiresSpec - Whether generator needs existing OpenAPI spec
   * @param {string} generator - Generator name for error context
   * @throws {Error} If prerequisites are not met
   */
  static validateGeneratorPrerequisites(options, generator) {
    const { outputDir, configPath, jsdocFiles, requiresSpec } = options;

    // Ensure output directory exists
    this.ensureDocsDir(outputDir);

    // Validate server config (for OpenAPI generators)
    if (configPath && !fs.existsSync(configPath)) {
      throw new Error(`Server config file not found: ${configPath}`);
    }

    // Validate JSDoc files (for OpenAPI generators)
    if (jsdocFiles && jsdocFiles.length > 0) {
      this.validateJSDocFiles(jsdocFiles, generator);
    }

    // Validate existing OpenAPI spec (for spec consumers)
    if (requiresSpec) {
      const specPath = path.join(outputDir, OUTPUT_FILES.OPENAPI_SPEC);
      if (!fs.existsSync(specPath)) {
        throw new Error('OpenAPI spec not found. Run OpenAPI generator first.');
      }

      try {
        const specContent = fs.readFileSync(specPath, 'utf8');
        const spec = JSON.parse(specContent);

        if (!spec.openapi || !spec.info || !spec.paths) {
          throw new Error('Invalid OpenAPI specification format');
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error('OpenAPI spec contains invalid JSON');
        }
        throw error;
      }
    }
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
      const docsDir = DEFAULT_OUTPUT_DIR;
      if (!fs.existsSync(docsDir)) return;

      const oneHourAgo = Date.now() - 3600000;
      const filesToClean = fs.readdirSync(docsDir)
        .filter(file => !filesToKeep.includes(file) && file !== '.gitkeep')
        .map(file => ({ file, path: path.join(docsDir, file) }))
        .filter(({ path: filePath }) => {
          try {
            return fs.statSync(filePath).mtime.getTime() < oneHourAgo;
          } catch {
            return false;
          }
        });

      filesToClean.forEach(({ path: filePath }) => fs.unlinkSync(filePath));

      if (filesToClean.length > 0) {
        console.log(`🧹 Cleaned ${filesToClean.length} old files from docs directory`);
      }
    } catch (error) {
      console.warn('⚠️  Could not clean docs directory:', error.message);
    }
  }
}

