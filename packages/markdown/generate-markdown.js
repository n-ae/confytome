/**
 * Custom Widdershins Template Markdown Generator
 *
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Uses custom widdershins template for Confluence-friendly output with code samples
 */

import fs from 'fs';
import path from 'path';
import { SpecConsumerGeneratorBase, BaseGenerator } from '@confytome/core/utils/base-generator.js';
import { TemplateManager } from './utils/template-manager.js';

class MarkdownGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('generate-markdown', 'Generating Confluence-friendly Markdown (custom widdershins template)', outputDir, services);
  }

  async generate() {
    console.log('📝 Generating Markdown with custom widdershins template...');

    return this.generateWithExternalTool('markdown', 'api-docs.md', async(openApiSpec, services, outputPath) => {
      const specPath = path.join(this.outputDir, 'api-spec.json');
      const templateDir = services.template.getWiddershinsPath();

      // Prepare template data
      const templateData = services.branding.getMarkdownTemplateData();

      // Process the main template to inject branding data
      await this.processWiddershinsTemplate(templateDir, templateData);

      // Use widdershins as a library with proper ES module import
      try {
        const widdershins = await import('widdershins');
        const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

        const options = {
          user_templates: templateDir,
          language_tabs: ['shell:cURL'],
          omitHeader: true,
          summary: true,
          code: true,
          httpsnippet: false
        };

        const markdown = await widdershins.convert(spec, options);
        fs.writeFileSync(outputPath, markdown, 'utf8');

      } catch (error) {
        throw new Error(`Failed to generate Markdown documentation: ${error.message}`);
      }

      // Write output file for standard handling
      const content = fs.readFileSync(outputPath, 'utf8');
      this.writeOutputFile(outputPath, content, 'Confluence-ready Markdown documentation created');
    }, 'Confluence-ready Markdown documentation created');
  }

  /**
   * Process widdershins templates to inject branding data instead of using environment variables
   * For now, we'll use environment variables but in a cleaner way through the service layer
   * Future enhancement: Create template preprocessing system
   * @param {string} templateDir - Directory containing templates
   * @param {Object} templateData - Data to inject into templates
   */
  async processWiddershinsTemplate(templateDir, templateData) {
    // For this implementation, we still use environment variables but managed by services
    // This is safer than regex replacement and maintains compatibility
    // Future: implement proper template preprocessing

    if (templateData.excludeBrand) {
      process.env.CONFYTOME_NO_BRAND = 'true';
    } else {
      delete process.env.CONFYTOME_NO_BRAND;
      process.env.CONFYTOME_VERSION = templateData.version || 'unknown';
    }
  }

  calculateDocumentStats(openApiSpec, outputPath) {
    // Use the standard stats calculation
    super.calculateDocumentStats(openApiSpec, outputPath);
    // Add custom stat for this generator
    this.addStat('Generator', 'widdershins (custom template)');
  }

  getSuccessMessage() {
    return 'Confluence-ready Markdown documentation generation completed';
  }
}

// Legacy function for backwards compatibility
function main() {
  const generator = new MarkdownGenerator();
  return generator.run();
}

// Auto-run if this is the main module
BaseGenerator.runIfMain(MarkdownGenerator, import.meta.url);

// Export both class and legacy function
export { MarkdownGenerator, main };
export default main;
