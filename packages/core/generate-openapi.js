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

      // Process JSDoc files
      console.log(`📖 Processing ${jsdocFiles.length} JSDoc files...`);
      console.log('📖 Processing JSDoc comments...');

      const swaggerOptions = {
        definition: serverConfig,
        apis: jsdocFiles
      };

      // Generate OpenAPI spec
      const openApiSpec = swaggerJSDoc(swaggerOptions);

      if (!openApiSpec || Object.keys(openApiSpec).length === 0) {
        throw new Error('Failed to generate OpenAPI spec. Check JSDoc comments in your files.');
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
