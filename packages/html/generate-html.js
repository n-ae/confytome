/**
 * Simple HTML Documentation Generator
 *
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Generates professional styled HTML documentation
 */

import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';
import { getOutputDir, OUTPUT_FILES } from '@confytome/core/constants.js';

class SimpleDocsGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super('generate-html', 'Generating HTML documentation (OpenAPI spec agnostic)', outputDir, services);
    this.processor = new OpenApiProcessor();
  }

  /**
   * Get generator metadata (implements IGenerator interface)
   * @returns {GeneratorMetadata}
   */
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'html',
      'Professional styled HTML documentation generator',
      'SimpleDocsGenerator',
      'api-docs.html'
    );
  }

  // Uses base class validation - no override needed

  // Uses base class initialization - no override needed

  async generate(_options = {}) {
    console.log('🎨 Generating HTML documentation...');

    try {
      const result = await this.generateDocument('html', OUTPUT_FILES.HTML_DOCS, (openApiSpec, services) => {
        return this.generateHTML(openApiSpec, services);
      });

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

  generateHTML(openApiSpec, services) {
    // Use OpenApiProcessor to get structured data
    const templateData = services.branding.getHtmlTemplateData();
    const processorOptions = {
      excludeBrand: templateData.excludeBrand,
      version: templateData.version || 'unknown'
    };

    this.processor.options = { ...this.processor.options, ...processorOptions };
    const data = this.processor.process(openApiSpec);

    // Convert processed data to expected format for HTML generation
    const tagSections = {};
    data.resources.forEach(resource => {
      tagSections[resource.name] = {
        description: resource.description || '',
        endpoints: resource.endpoints.map(endpoint => ({
          path: endpoint.path,
          method: endpoint.method,
          summary: endpoint.summary,
          description: endpoint.description,
          parameters: endpoint.parameters?.parameters || [],
          responses: endpoint.responses.reduce((acc, response) => {
            acc[response.code] = { description: response.description };
            return acc;
          }, {})
        }))
      };
    });

    return this.buildHTMLDocument(data.info, data.servers, tagSections, data.schemas, services);
  }

  buildHTMLDocument(info, servers, tagSections, schemas, services) {
    const serverUrls = servers?.servers ? servers.servers.map(s => s.url).join(', ') : 'Not specified';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${info.title} - API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 2rem; background: #f8f9fa; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #0d6efd; border-bottom: 3px solid #0d6efd; padding-bottom: 0.5rem; }
    h2 { color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 0.3rem; margin-top: 2rem; }
    h3 { color: #6f42c1; margin-top: 1.5rem; }
    .endpoint { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; margin: 1rem 0; padding: 1rem; }
    .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; font-weight: bold; font-size: 0.8rem; }
    .method.GET { background: #28a745; }
    .method.POST { background: #007bff; }
    .method.PUT { background: #ffc107; color: #212529; }
    .method.DELETE { background: #dc3545; }
    .path { font-family: 'Courier New', monospace; background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 3px; margin-left: 0.5rem; }
    .description { margin: 0.5rem 0; color: #6c757d; }
    .parameters { margin-top: 1rem; }
    .param { background: white; border: 1px solid #e9ecef; padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px; }
    .param-name { font-weight: bold; color: #495057; }
    .param-type { color: #6f42c1; font-size: 0.9em; }
    .responses { margin-top: 1rem; }
    .response-code { font-weight: bold; color: #28a745; }
    .info-section { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 1rem; margin-bottom: 2rem; }
    .server-info { background: #fff3cd; border: 1px solid #ffd93d; border-radius: 6px; padding: 1rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${info.title}</h1>

    <div class="info-section">
      <h3>API Information</h3>
      <p><strong>Version:</strong> ${info.version}</p>
      ${info.description ? `<p><strong>Description:</strong> ${info.description}</p>` : ''}
      ${info.contact?.email ? `<p><strong>Contact:</strong> ${info.contact.email}</p>` : ''}
    </div>

    <div class="server-info">
      <h3>Server Information</h3>
      <p><strong>Base URLs:</strong> ${serverUrls}</p>
    </div>

    ${this.generateTagSections(tagSections)}
  </div>

  <hr style="margin: 3rem 0; border: none; border-top: 1px solid #dee2e6;">
  <p style="text-align: center; color: #6c757d;">
    ${services.branding.generateForHtml()}
  </p>
</body>
</html>`;
  }

  generateTagSections(tagSections) {
    return Object.entries(tagSections).map(([tagName, section]) => `
      <h2>${tagName}</h2>
      ${section.description ? `<p class="description">${section.description}</p>` : ''}
      ${section.endpoints.map(endpoint => `
        <div class="endpoint">
          <h3>
            <span class="method ${endpoint.method}">${endpoint.method}</span>
            <span class="path">${endpoint.path}</span>
          </h3>
          ${endpoint.summary ? `<p><strong>${endpoint.summary}</strong></p>` : ''}
          ${endpoint.description ? `<p class="description">${endpoint.description}</p>` : ''}
          ${endpoint.parameters.length > 0 ? `
            <div class="parameters">
              <h4>Parameters</h4>
              ${endpoint.parameters.map(param => `
                <div class="param">
                  <span class="param-name">${param.name}</span>
                  <span class="param-type">(${param.in} - ${param.type || 'string'})</span>
                  ${param.required ? '<span style="color: #dc3545;">*</span>' : ''}
                  ${param.description ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.9em;">${param.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          <div class="responses">
            <h4>Responses</h4>
            ${Object.entries(endpoint.responses).map(([code, response]) => `
              <div class="param">
                <span class="response-code">${code}</span> - ${response.description || 'Success'}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `).join('');
  }


  getSuccessMessage() {
    return 'HTML documentation generation completed';
  }
}

// Export class only
export { SimpleDocsGenerator };
export default SimpleDocsGenerator;
