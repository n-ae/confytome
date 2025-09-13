/**
 * Standalone Swagger UI Generator
 *
 * Truly independent implementation with zero external dependencies
 * beyond swagger-ui-dist. Can run via "npx @confytome/swagger"
 * without any core package dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { StandaloneBase } from './utils/StandaloneBase.js';

const require = createRequire(import.meta.url);

export class StandaloneSwaggerGenerator extends StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    super(outputDir, options);

    // Asset cache for memory optimization
    this._assetCache = new Map();
  }

  /**
   * Get generator metadata (self-contained)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    return {
      name: 'swagger',
      description: 'Interactive, self-contained Swagger UI documentation generator',
      version: '1.5.0',
      packageName: '@confytome/swagger',
      cliCommand: 'confytome-swagger',
      inputs: ['api-spec.json'],
      outputs: ['swagger-ui.html'],
      features: ['interactive-ui', 'self-contained', 'responsive-design', 'try-it-out']
    };
  }

  /**
   * Validate generator prerequisites (extends base validation)
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(options = {}) {
    const baseValidation = await super.validate(options);

    // Check swagger-ui-dist availability
    try {
      require.resolve('swagger-ui-dist/package.json');
      this.log('Swagger UI distribution found');
    } catch {
      baseValidation.errors.push('swagger-ui-dist package not found');
    }

    return baseValidation;
  }

  /**
   * Initialize the generator (extends base initialization)
   * @param {Object} options - Initialization options
   * @returns {Promise<ValidationResult>} Initialization result
   */
  async initialize(options = {}) {
    const baseInit = await super.initialize(options);

    this.log('Swagger UI generator initialized');

    return baseInit;
  }

  /**
   * Generate Swagger UI documentation
   * @param {Object} _options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(_options = {}) {
    this.log('🌐 Generating interactive Swagger UI...');

    try {
      // Load and parse OpenAPI spec using base class method
      const spec = this.loadOpenAPISpec();

      // Generate Swagger UI HTML
      const html = this.generateSwaggerUI(spec);

      // Write output using base class method
      const result = this.writeOutputFile('swagger-ui.html', html, 'Interactive Swagger UI generated');

      // Add additional stats
      if (result.success) {
        const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
        const endpointCount = spec.paths ?
          Object.values(spec.paths).reduce((total, pathItem) => {
            return total + Object.keys(pathItem).filter(method =>
              ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)
            ).length;
          }, 0) : 0;

        result.stats = {
          ...result.stats,
          paths: pathCount,
          endpoints: endpointCount,
          title: spec.info?.title || 'API',
          version: spec.info?.version || '1.0.0'
        };
      }

      return result;
    } catch (error) {
      this.log(`Swagger UI generation failed: ${error.message}`, 'error');
      return {
        success: false,
        outputPath: null,
        size: 0,
        stats: { error: error.message }
      };
    }
  }

  /**
   * Generate Swagger UI HTML content
   * @param {Object} openApiSpec - OpenAPI specification
   * @returns {string} Complete HTML document
   */
  generateSwaggerUI(openApiSpec) {
    // Load assets with caching for memory optimization
    const assets = this._loadSwaggerAssets();

    const { css, bundleJs, standaloneJs } = assets;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${openApiSpec.info.title} v${openApiSpec.info.version} - Swagger UI</title>

  <style>
    ${css}

    /* Custom branding styles */
    .custom-header {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 20px;
    }

    .custom-header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 2rem;
    }

    .custom-header .version {
      color: #6c757d;
      font-size: 1.1rem;
      margin-bottom: 10px;
    }

    .custom-header .description {
      color: #495057;
      line-height: 1.6;
    }

    .custom-footer {
      margin-top: 2rem;
      padding: 1rem;
      text-align: center;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>${openApiSpec.info.title}</h1>
    <div class="version">Version ${openApiSpec.info.version}</div>
    ${openApiSpec.info.description ? `<div class="description">${openApiSpec.info.description}</div>` : ''}
  </div>

  <div id="swagger-ui"></div>

  <div class="custom-footer">
    ${this.generateBranding('html')}
  </div>

  <script>
    ${bundleJs}
  </script>

  <script>
    ${standaloneJs}
  </script>

  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(openApiSpec, null, 2)};

      // Initialize Swagger UI
      const ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        docExpansion: "list",
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>`;

    return html;
  }

  /**
   * Load Swagger UI assets with caching to reduce memory usage
   * @returns {Object} Asset object with CSS and JS content
   */
  _loadSwaggerAssets() {
    const cacheKey = 'swagger-ui-assets';

    if (this._assetCache.has(cacheKey)) {
      return this._assetCache.get(cacheKey);
    }

    // Get Swagger UI distribution path
    const swaggerUIAssetPath = require.resolve('swagger-ui-dist/package.json');
    const swaggerUIDistPath = path.dirname(swaggerUIAssetPath);

    // Load assets - these are large files (~500KB+ each)
    this.log('Loading Swagger UI assets...');

    const assets = {
      css: fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui.css'), 'utf8'),
      bundleJs: fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui-bundle.js'), 'utf8'),
      standaloneJs: fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui-standalone-preset.js'), 'utf8')
    };

    // Cache the assets to avoid re-reading for subsequent generations
    this._assetCache.set(cacheKey, assets);

    this.log('Swagger UI assets cached');
    return assets;
  }
}
