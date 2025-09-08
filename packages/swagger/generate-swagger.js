/**
 * Static Swagger UI Generator
 *
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Uses swagger-ui-dist to generate the typical Swagger UI interface
 * as a self-contained static HTML file
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { getOutputDir, OUTPUT_FILES } from '@confytome/core/constants.js';
const require = createRequire(import.meta.url);

function generateSwaggerUI(openApiSpec, options = {}) {
  const swaggerUIAssetPath = require.resolve('swagger-ui-dist/package.json');
  const swaggerUIDistPath = path.dirname(swaggerUIAssetPath);

  // Read Swagger UI assets
  const swaggerUICSS = fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui.css'), 'utf8');
  const swaggerUIJS = fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui-bundle.js'), 'utf8');
  const swaggerUIStandaloneJS = fs.readFileSync(path.join(swaggerUIDistPath, 'swagger-ui-standalone-preset.js'), 'utf8');

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${openApiSpec.info.title} v${openApiSpec.info.version} - Swagger UI</title>
  <style>
    ${swaggerUICSS}

    /* Custom styling */
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }

    *, *:before, *:after {
      box-sizing: inherit;
    }

    body {
      margin: 0;
      background: #fafafa;
    }

    /* Hide the top bar for cleaner embedding */
    .swagger-ui .topbar {
      display: none;
    }
    
    /* Custom header styling */
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      text-align: center;
    }

    .custom-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .custom-header p {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    /* Better mobile responsiveness */
    @media (max-width: 768px) {
      .swagger-ui .wrapper {
        padding: 0 10px;
      }

      .custom-header h1 {
        font-size: 1.4rem;
      }
    }

    /* Print styles */
    @media print {
      .swagger-ui .scheme-container,
      .swagger-ui .download-url-wrapper,
      .custom-header {
        display: none;
      }
    }

    /* Confluence-friendly styling */
    .swagger-ui .wrapper {
      max-width: none;
    }

    /* Better language support */
    .swagger-ui {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Try it out button styling - keep visible but note it won't work in static mode */
    .swagger-ui .try-out__btn {
      background: #f0f0f0;
      color: #999;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>${openApiSpec.info.title}</h1>
    <p>v${openApiSpec.info.version} - ${openApiSpec.info.description || ''}</p>
  </div>

  <div id="swagger-ui"></div>

  <script>
    ${swaggerUIJS}
    ${swaggerUIStandaloneJS}

    window.onload = function() {
      // Build a system
      const ui = SwaggerUIBundle({
        // Use embedded spec instead of URL
        spec: ${JSON.stringify(openApiSpec, null, 2)},
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

        // Configuration for static documentation
        validatorUrl: null,              // Disable online validator
        tryItOutEnabled: false,          // Disable try it out for static docs
        supportedSubmitMethods: [],      // Disable all HTTP methods
        docExpansion: 'list',           // Show operations collapsed by default
        defaultModelsExpandDepth: 1,    // Show models collapsed
        defaultModelExpandDepth: 1,     // Show model details collapsed
        displayOperationId: false,      // Hide operation IDs
        displayRequestDuration: false,  // Hide request duration
        showExtensions: false,          // Hide vendor extensions
        showCommonExtensions: false,    // Hide common extensions

        // Custom request interceptor to prevent actual requests
        requestInterceptor: function(request) {
          console.warn('This is a static documentation file. API requests cannot be made.');
          return request;
        },

        // Callback when UI is complete
        onComplete: function() {
          console.log('Swagger UI loaded - Static documentation mode');

          // Add warning about static mode
          const infoContainer = document.querySelector('.swagger-ui .info');
          if (infoContainer) {
            const warning = document.createElement('div');
            warning.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; color: #856404;';
            warning.innerHTML = '<strong>📋 Note:</strong> This is a static documentation file. "Try it out" functionality will not work.';
            infoContainer.appendChild(warning);
          }
        }
      });

      window.ui = ui;
    };
  </script>
  ${options.excludeBrand ? '' : `
  <div style="text-align: center; margin: 2rem 0; padding: 1rem; border-top: 1px solid #e5e5e5; color: #666; font-size: 0.9em;">
    <p style="margin: 0;">${options.branding || 'Generated with 🍃 confytome'}</p>
  </div>`}
</body>
</html>
`;

  return html;
}

import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';

class SwaggerUIGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super('generate-swagger', 'Generating Swagger UI static HTML (OpenAPI spec agnostic)', outputDir, services);
  }

  /**
   * Get generator metadata (implements IGenerator interface)
   * @returns {GeneratorMetadata}
   */
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'swagger',
      'Interactive Swagger UI documentation generator',
      'SwaggerUIGenerator',
      'api-swagger.html'
    );
  }

  /**
   * Validate generator prerequisites (extends base validation)
   */
  async validate(options = {}) {
    // Get base validation
    const baseValidation = await super.validate(options);

    // Check if swagger-ui-dist is available
    try {
      const require = createRequire(import.meta.url);
      require.resolve('swagger-ui-dist/package.json');
    } catch {
      baseValidation.errors.push('swagger-ui-dist package not found - required for Swagger UI generation');
    }

    // Recalculate valid status after adding errors
    baseValidation.valid = baseValidation.errors.length === 0;

    return baseValidation;
  }

  /**
   * Initialize generator (implements IGenerator interface)
   */
  async initialize(options = {}) {
    // Setup any configuration based on options
    if (options.excludeBrand !== undefined) {
      this.excludeBrand = options.excludeBrand;
    }

    // Call parent initialization if available
    if (super.initialize) {
      await super.initialize(options);
    }
  }

  async generate(_options = {}) {
    console.log('🎨 Generating Swagger UI HTML...');

    try {
      const result = await this.generateDocument('swagger', OUTPUT_FILES.SWAGGER_UI, (openApiSpec, services) => {
        return this.generateSwaggerUI(openApiSpec, services);
      });

      console.log(`\n🌐 You can open the file in browser: file://${path.resolve(result.outputPath)}`);

      return {
        success: true,
        outputs: [result.outputPath],
        stats: {
          outputPath: result.outputPath,
          fileSize: result.size,
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

  // Uses base class cleanup - no override needed

  generateSwaggerUI(openApiSpec, services) {
    // Generate branding using injected services
    const branding = services.branding.generateForSwagger();
    return generateSwaggerUI(openApiSpec, {
      excludeBrand: this.excludeBrand,
      branding
    });
  }


  getSuccessMessage() {
    return 'Swagger UI static HTML generation completed';
  }
}

// Export class and core function
export { SwaggerUIGenerator, generateSwaggerUI };
export default SwaggerUIGenerator;
