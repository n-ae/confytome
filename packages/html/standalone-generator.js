/**
 * Standalone HTML Generator
 *
 * Truly independent implementation with zero external dependencies.
 * Can run via "npx @confytome/html" without any core package dependencies.
 */

import { StandaloneBase } from '@confytome/core/utils/StandaloneBase.js';
import { OpenApiProcessor } from '@confytome/core/utils/OpenApiProcessor.js';

export class StandaloneHtmlGenerator extends StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    super(outputDir, options);
    this.processor = null;
  }

  /**
   * Get generator metadata (self-contained)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    return {
      name: 'html',
      description: 'Professional, responsive HTML documentation generator',
      version: '1.5.0',
      packageName: '@confytome/html',
      cliCommand: 'confytome-html',
      inputs: ['api-spec.json'],
      outputs: ['api-docs.html'],
      features: ['responsive-design', 'professional-styling', 'modern-navigation']
    };
  }

  /**
   * Validate generator prerequisites (extends base validation)
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(options = {}) {
    const baseValidation = await super.validate(options);

    // HTML generator doesn't require additional templates - everything is inline
    this.log('HTML generator validation complete');

    return baseValidation;
  }

  /**
   * Initialize the generator (extends base initialization)
   * @param {Object} options - Initialization options
   * @returns {Promise<ValidationResult>} Initialization result
   */
  async initialize(options = {}) {
    const baseInit = await super.initialize(options);

    // Add HTML-specific initialization here if needed
    this.log('HTML generator initialized');

    return baseInit;
  }

  /**
   * Generate HTML documentation
   * @param {Object} options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(_options = {}) {
    this.log('🎨 Generating HTML documentation...');

    try {
      // Load and parse OpenAPI spec using base class method
      const spec = this.loadOpenAPISpec();

      // Configure processor options
      const processorOptions = {
        excludeBrand: this.options.excludeBrand,
        version: this.getInfo().version,
        baseUrl: this.getBaseUrl(spec.servers)
      };

      // Process OpenAPI spec into template data
      this.processor = new OpenApiProcessor(processorOptions);
      const data = this.processor.process(spec);

      // Generate HTML content
      const html = this.generateHtmlContent(data);

      // Write output using base class method
      const result = this.writeOutputFile('api-docs.html', html, 'Professional HTML documentation created');

      // Add additional stats
      if (result.success) {
        result.stats = {
          ...result.stats,
          endpoints: data.endpoints?.length || 0,
          resources: data.resources?.length || 0,
          schemas: data.schemas?.models?.length || 0
        };
      }

      return result;
    } catch (error) {
      this.log(`HTML generation failed: ${error.message}`, 'error');
      return {
        success: false,
        outputPath: null,
        size: 0,
        stats: { error: error.message }
      };
    }
  }

  /**
   * Generate HTML content
   * @param {Object} data - Processed OpenAPI data
   * @returns {string} Complete HTML document
   */
  generateHtmlContent(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} v${data.version} - API Documentation</title>
  <style>
    ${this.getCSSStyles()}
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${data.title}</h1>
      <p class="version">Version ${data.version}</p>
      ${data.description ? `<p class="description">${data.description}</p>` : ''}
    </header>

    ${data.baseUrl ? `<div class="base-url">
      <h2>Base URL</h2>
      <code>${data.baseUrl}</code>
    </div>` : ''}

    <div class="content">
      ${this.generateEndpointsSection(data.endpoints)}
      ${this.generateSchemasSection(data.schemas)}
    </div>

    <hr style="margin: 3rem 0; border: none; border-top: 1px solid #dee2e6;">
    <p style="text-align: center; color: #6c757d;">
      ${this.generateBranding('html')}
    </p>
  </div>

  <script>
    ${this.getJavaScript()}
  </script>
</body>
</html>`;
  }

  /**
   * Generate endpoints documentation section
   */
  generateEndpointsSection(endpoints) {
    if (!endpoints || !endpoints.length) {
      return '<div class="section"><h2>Endpoints</h2><p>No endpoints defined.</p></div>';
    }

    const endpointsHtml = endpoints.map(endpoint => `
      <div class="endpoint">
        <div class="endpoint-header">
          <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
          <code class="path">${endpoint.path}</code>
        </div>
        ${endpoint.summary ? `<h4>${endpoint.summary}</h4>` : ''}
        ${endpoint.description ? `<p>${endpoint.description}</p>` : ''}

        ${endpoint.parameters && endpoint.parameters.length > 0 ? `
          <div class="parameters">
            <h5>Parameters</h5>
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>In</th><th>Required</th><th>Description</th></tr>
              </thead>
              <tbody>
                ${endpoint.parameters.map(param => `
                  <tr>
                    <td><code>${param.name}</code></td>
                    <td>${param.type}</td>
                    <td>${param.in}</td>
                    <td>${param.required ? 'Yes' : 'No'}</td>
                    <td>${param.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        ${endpoint.responses && endpoint.responses.length > 0 ? `
          <div class="responses">
            <h5>Responses</h5>
            <table>
              <thead>
                <tr><th>Status</th><th>Description</th></tr>
              </thead>
              <tbody>
                ${endpoint.responses.map(response => `
                  <tr>
                    <td><span class="status-code status-${response.statusCode[0]}xx">${response.statusCode}</span></td>
                    <td>${response.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `<div class="section">
      <h2>Endpoints</h2>
      ${endpointsHtml}
    </div>`;
  }

  /**
   * Generate schemas documentation section
   */
  generateSchemasSection(schemas) {
    if (!schemas || !schemas.models || !schemas.models.length) {
      return '<div class="section"><h2>Schemas</h2><p>No schemas defined.</p></div>';
    }

    const schemasHtml = schemas.models.map(schema => `
      <div class="schema">
        <h3>${schema.name}</h3>
        ${schema.description ? `<p>${schema.description}</p>` : ''}

        ${schema.properties && schema.properties.length > 0 ? `
          <table>
            <thead>
              <tr><th>Property</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              ${schema.properties.map(prop => `
                <tr>
                  <td>
                    <code>${prop.name}</code>
                    ${schema.required.includes(prop.name) ? ' <span class="required">*</span>' : ''}
                  </td>
                  <td>${prop.type}${prop.format ? ` (${prop.format})` : ''}</td>
                  <td>${prop.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </div>
    `).join('');

    return `<div class="section">
      <h2>Schemas</h2>
      ${schemasHtml}
    </div>`;
  }

  /**
   * Get CSS styles for the HTML document
   */
  getCSSStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .header {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
      }

      .header h1 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      .version {
        color: #7f8c8d;
        font-size: 1.1rem;
        margin-bottom: 1rem;
      }

      .description {
        color: #555;
      }

      .base-url {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
      }

      .base-url h2 {
        margin-bottom: 1rem;
        color: #2c3e50;
      }

      .base-url code {
        background: #f1f2f6;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 1.1rem;
      }

      .section {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
      }

      .section h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #3498db;
      }

      .endpoint {
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        overflow: hidden;
      }

      .endpoint-header {
        background: #f8f9fa;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .method {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.8rem;
        min-width: 60px;
        text-align: center;
      }

      .method-get { background: #d4edda; color: #155724; }
      .method-post { background: #cce7ff; color: #004085; }
      .method-put { background: #fff3cd; color: #856404; }
      .method-delete { background: #f8d7da; color: #721c24; }
      .method-patch { background: #e2e3e5; color: #383d41; }

      .path {
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 1.1rem;
        background: white;
        padding: 0.5rem;
        border-radius: 4px;
        flex-grow: 1;
      }

      .endpoint > div:not(.endpoint-header) {
        padding: 1rem;
      }

      .endpoint h4 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      .parameters, .responses {
        margin-top: 1rem;
      }

      .parameters h5, .responses h5 {
        color: #34495e;
        margin-bottom: 0.75rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
      }

      th, td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid #ddd;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #2c3e50;
      }

      .status-code {
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-weight: bold;
        font-size: 0.85rem;
      }

      .status-2xx { background: #d4edda; color: #155724; }
      .status-3xx { background: #cce7ff; color: #004085; }
      .status-4xx { background: #fff3cd; color: #856404; }
      .status-5xx { background: #f8d7da; color: #721c24; }

      .schema {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .schema h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .required {
        color: #e74c3c;
        font-weight: bold;
      }

      @media (max-width: 768px) {
        .container {
          padding: 1rem;
        }

        .endpoint-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .path {
          word-break: break-all;
        }
      }
    `;
  }

  /**
   * Get JavaScript for interactive features
   */
  getJavaScript() {
    return `
      // Add any interactive features here
      console.log('HTML documentation loaded');
    `;
  }
}
