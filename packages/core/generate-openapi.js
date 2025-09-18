/**
 * Primary OpenAPI Spec Generator
 *
 * This is the first step for all documentation generation.
 * Generates OpenAPI spec from JSDoc which all other generators consume.
 */

import swaggerJSDoc from 'swagger-jsdoc';
import path from 'node:path';
import { OpenAPIGeneratorBase } from './utils/base-generator.js';
import { MetadataFactory } from './interfaces/IGenerator.js';
import { FileManager } from './utils/file-manager.js';
import { OUTPUT_FILES } from './constants.js';

class OpenAPIGenerator extends OpenAPIGeneratorBase {
  constructor() {
    super('generate-openapi', 'Generating OpenAPI spec (JSDoc → OpenAPI)');
  }

  /**
   * Get generator metadata (implements IGenerator interface)
   * @returns {GeneratorMetadata}
   */
  static getMetadata() {
    return MetadataFactory.createOpenAPIGeneratorMetadata(
      'core',
      'OpenAPI 3.0.3 specification generator from JSDoc comments',
      'OpenAPIGenerator',
      ['api-spec.json']
    );
  }

  /**
   * Validate generator prerequisites (implements IGenerator interface)
   */
  async validate(options = {}) {
    const errors = [];
    const warnings = [];

    // Check if JSDoc files are provided and exist
    if (options.jsdocFiles) {
      const missingFiles = options.jsdocFiles.filter(file =>
        !require('fs').existsSync(file)
      );
      if (missingFiles.length > 0) {
        errors.push(`JSDoc files not found: ${missingFiles.join(', ')}`);
      }
    } else {
      errors.push('JSDoc files must be provided');
    }

    // Check server config
    if (options.serverConfigPath) {
      if (!require('fs').existsSync(options.serverConfigPath)) {
        errors.push(`Server config file not found: ${options.serverConfigPath}`);
      }
    } else {
      errors.push('Server configuration file must be provided');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Initialize generator (implements IGenerator interface)
   */
  async initialize(options = {}) {
    // Setup any required state
    this.initialized = true;

    // Call parent initialization if available
    if (super.initialize) {
      await super.initialize(options);
    }
  }

  async generate(options = {}) {
    const { serverConfigPath, jsdocFiles } = options;

    try {
      // Load and validate server configuration
      const serverConfig = this.loadServerConfig(serverConfigPath);

      // Process JSDoc files with enhanced error context
      console.log(`📖 Processing ${jsdocFiles.length} JSDoc files...`);
      console.log(`📁 Files: ${jsdocFiles.join(', ')}`);
      console.log('📖 Processing JSDoc comments...');

      const swaggerOptions = {
        definition: serverConfig,
        apis: jsdocFiles
      };

      // Generate OpenAPI spec with enhanced error handling
      let openApiSpec;
      try {
        openApiSpec = swaggerJSDoc(swaggerOptions);
      } catch (jsdocError) {
        // Enhance JSDoc parsing error with file context
        const enhancedError = this.enhanceJSDocError(jsdocError, jsdocFiles);
        throw enhancedError;
      }

      if (!openApiSpec || Object.keys(openApiSpec).length === 0) {
        const fileList = jsdocFiles.map(f => `  - ${f}`).join('\n');
        throw new Error(`Failed to generate OpenAPI spec. Check JSDoc comments in your files:\n${fileList}\n\nEnsure files contain valid @swagger JSDoc annotations.`);
      }

      // Write the OpenAPI spec
      const outputPath = path.join(this.outputDir, OUTPUT_FILES.OPENAPI_SPEC);
      const specContent = JSON.stringify(openApiSpec, null, 2);

      FileManager.writeFile(
        outputPath,
        specContent,
        this.name,
        'OpenAPI spec created'
      );

      // Calculate statistics
      this.calculateStats(openApiSpec, specContent);

      return {
        success: true,
        outputs: [outputPath],
        stats: {
          spec: openApiSpec,
          outputPath,
          fileSize: Buffer.byteLength(specContent, 'utf8'),
          ...this.stats
        }
      };
    } catch (error) {
      return {
        success: false,
        outputs: [],
        stats: { error: error.message }
      };
    }
  }

  /**
   * Enhance JSDoc parsing errors with file context
   * @param {Error} error - Original swagger-jsdoc error
   * @param {Array} jsdocFiles - List of JSDoc files being processed
   * @returns {Error} Enhanced error with better context
   */
  enhanceJSDocError(error, jsdocFiles) {
    let enhancedMessage = `JSDoc parsing failed: ${error.message}`;
    let filename = null;
    let lineNumber = null;

    // Extract filename from various error message patterns
    const filePatterns = [
      /in file ['"](.*?)['"]/, // swagger-jsdoc pattern
      /file:\/\/([^)]+)/, // File URL pattern
      /([^\/\\]+\.(js|ts|jsx|tsx))/, // Simple filename pattern
      /at ([^(]+\.(js|ts|jsx|tsx))/, // Stack trace pattern
      /Error processing file:?\s*([^\s]+\.(js|ts|jsx|tsx))/ // Custom error pattern
    ];

    for (const pattern of filePatterns) {
      const match = error.message.match(pattern) || error.stack?.match(pattern);
      if (match) {
        filename = match[1] || match[0];
        // Clean up the filename
        filename = filename.replace(/^file:\/\//, '').split('?')[0];
        // Normalize path separators for cross-platform compatibility
        filename = path.normalize(filename);
        break;
      }
    }

    // Extract line number from various patterns
    const linePatterns = [
      /line (\d+)/i, // Explicit line mention
      /:(\d+):\d+/, // Standard :line:column format
      /line:?\s*(\d+)/, // Line: number format
      /at.*:(\d+):\d+\)/, // Stack trace format
      /\((\d+),\d+\)/ // (line,column) format
    ];

    for (const pattern of linePatterns) {
      const match = error.message.match(pattern) || error.stack?.match(pattern);
      if (match) {
        lineNumber = match[1];
        break;
      }
    }

    // Try to identify the problematic file by checking error stack
    if (!filename && error.stack) {
      const stackLines = error.stack.split('\n');
      for (const line of stackLines) {
        for (const file of jsdocFiles) {
          // Normalize both paths for comparison on Windows
          const normalizedLine = line.replace(/\\/g, '/');
          const normalizedFile = file.replace(/\\/g, '/');
          if (normalizedLine.includes(normalizedFile) || normalizedLine.includes(path.normalize(file))) {
            filename = file;
            // Try to extract line number from this stack line
            const lineMatch = line.match(/:(\d+):\d+\)/);
            if (lineMatch) {
              lineNumber = lineMatch[1];
            }
            break;
          }
        }
        if (filename) break;
      }
    }

    // Build enhanced error message
    if (filename) {
      enhancedMessage = `📁 File: ${filename}`;
      if (lineNumber) {
        enhancedMessage += `\n📍 Line: ${lineNumber}`;
      }
      enhancedMessage += `\n💥 Error: ${error.message}`;
    } else {
      // If no specific file identified, list all processed files
      const fileList = jsdocFiles.map(f => `  - ${f}`).join('\n');
      enhancedMessage = `💥 Error: ${error.message}\n📁 Files being processed:\n${fileList}`;
      if (lineNumber) {
        enhancedMessage += `\n📍 Line: ${lineNumber}`;
      }
    }

    // Add helpful context based on error type
    if (error.message.includes('Unexpected token') || error.message.includes('SyntaxError')) {
      enhancedMessage += '\n💡 Tip: Check for malformed JSDoc comments or invalid YAML/JSON in @swagger annotations';
    } else if (error.message.includes('swagger') || error.message.includes('openapi')) {
      enhancedMessage += '\n💡 Tip: Verify @swagger JSDoc annotations follow OpenAPI 3.0.3 specification';
    }

    const enhancedError = new Error(enhancedMessage);
    enhancedError.originalError = error;
    enhancedError.jsdocFiles = jsdocFiles;
    enhancedError.filename = filename;
    enhancedError.lineNumber = lineNumber;

    return enhancedError;
  }

  /**
   * Cleanup resources (implements IGenerator interface)
   */
  async cleanup() {
    // Clean up any temporary resources
    this.initialized = false;

    // Call parent cleanup if available
    if (super.cleanup) {
      await super.cleanup();
    }
  }

  calculateStats(spec, content) {
    const pathCount = Object.keys(spec.paths || {}).length;
    let endpointCount = 0;

    // Count total endpoints
    for (const path in spec.paths || {}) {
      endpointCount += Object.keys(spec.paths[path]).length;
    }

    const sizeKB = (Buffer.byteLength(content, 'utf8') / 1024).toFixed(1);
    const serverCount = (spec.servers || []).length;
    const hasAuth = !!(spec.components && spec.components.securitySchemes);

    this.addStat(`${pathCount} unique paths`, '');
    this.addStat(`${endpointCount} endpoint`, '');
    this.addStat(`${sizeKB} KB OpenAPI spec`, '');
    this.addStat('Auth', hasAuth ? 'Included' : 'Not configured');
    this.addStat('Servers', `${serverCount} server(s)`);
  }

  getSuccessMessage() {
    return 'OpenAPI spec generation completed';
  }
}

export { OpenAPIGenerator };
