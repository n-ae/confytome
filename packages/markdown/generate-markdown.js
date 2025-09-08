/**
 * Mustache Template Markdown Generator
 *
 * OpenAPI spec agnostic - consumes the generated spec from generate-openapi.js
 * Uses Mustache templates for Confluence-friendly output with code samples
 * Uses Mustache templates for lightweight, secure markdown generation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { default as Mustache } from 'mustache';
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';
import { getOutputDir, OUTPUT_FILES } from '@confytome/core/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MarkdownGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super('generate-markdown', 'Generating Confluence-friendly Markdown (Mustache templates)', outputDir, services);
    this.processor = new OpenApiProcessor();
  }

  /**
   * Get generator metadata (implements IGenerator interface)
   * @returns {GeneratorMetadata}
   */
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'markdown',
      'Confluence-friendly Markdown documentation generator using Mustache',
      'MarkdownGenerator',
      'api-docs.md'
    );
  }

  /**
   * Validate generator prerequisites (extends base validation)
   */
  async validate(options = {}) {
    // Get base validation
    const baseValidation = await super.validate(options);

    // Add template-specific validation
    const templateDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templateDir)) {
      baseValidation.warnings.push('Templates directory not found - will use default templates');
    }

    return baseValidation;
  }

  // Uses base class initialization - no override needed

  async generate(_options = {}) {
    console.log('📝 Generating Markdown with Mustache templates...');

    try {
      const result = await this.generateWithExternalTool('markdown', OUTPUT_FILES.MARKDOWN_DOCS, async(openApiSpec, services, outputPath) => {
        const specPath = path.join(this.outputDir, OUTPUT_FILES.OPENAPI_SPEC);

        // Prepare template data
        const templateData = services.branding.getMarkdownTemplateData();

        try {
        // Load and parse OpenAPI spec
          const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

          // Configure processor options
          const processorOptions = {
            excludeBrand: templateData.excludeBrand,
            version: templateData.version || 'unknown',
            baseUrl: this.getBaseUrl(spec.servers)
          };

          // Process OpenAPI spec into template data
          this.processor.options = { ...this.processor.options, ...processorOptions };
          const data = this.processor.process(spec);

          // Load Mustache template
          const templatePath = path.join(__dirname, 'templates', 'main.mustache');
          const template = fs.readFileSync(templatePath, 'utf8');

          // Render template with data
          const markdown = Mustache.render(template, data);

          // Write output
          fs.writeFileSync(outputPath, markdown, 'utf8');

        } catch (error) {
          throw new Error(`Failed to generate Markdown documentation: ${error.message}`);
        }

        // Write output file for standard handling
        const content = fs.readFileSync(outputPath, 'utf8');
        this.writeOutputFile(outputPath, content, 'Confluence-ready Markdown documentation created');
      }, 'Confluence-ready Markdown documentation created');

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

  /**
   * Get base URL from servers array
   * @param {Array} servers - OpenAPI servers array
   * @returns {string} Base URL
   */
  getBaseUrl(servers) {
    if (!servers || !servers.length) return '';
    return servers[servers.length - 1].url; // Use last server for consistency
  }

  calculateDocumentStats(openApiSpec, outputPath) {
    // Use the standard stats calculation
    super.calculateDocumentStats(openApiSpec, outputPath);
    // Add custom stat for this generator
    this.addStat('Generator', 'Mustache (custom template)');
  }

  getSuccessMessage() {
    return 'Confluence-ready Markdown documentation generation completed';
  }
}

// Export class only
export { MarkdownGenerator };
export default MarkdownGenerator;
