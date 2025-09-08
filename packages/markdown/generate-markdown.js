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
import { VersionService } from '@confytome/core/services/VersionService.js';
import { OpenApiProcessor } from './utils/OpenApiProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class MarkdownGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super('generate-markdown', 'Generating Confluence-friendly Markdown (Mustache templates)', outputDir, services);
    this.processor = null; // Will be created with options in generate()
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

  async generate(options = {}) {
    console.log('📝 Generating Markdown with Mustache templates...');

    try {
      const specPath = path.join(this.outputDir, OUTPUT_FILES.OPENAPI_SPEC);
      const outputPath = path.join(this.outputDir, OUTPUT_FILES.MARKDOWN_DOCS);

      // Check if OpenAPI spec exists
      if (!fs.existsSync(specPath)) {
        throw new Error(`OpenAPI specification not found: ${specPath}`);
      }

      // Load and parse OpenAPI spec
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

      // Configure processor options
      const processorOptions = {
        excludeBrand: options.excludeBrand || false,
        version: VersionService.getCurrentVersion(import.meta.url),
        baseUrl: this.getBaseUrl(spec.servers)
      };

      // Process OpenAPI spec into template data
      this.processor = new OpenApiProcessor(processorOptions);
      const data = this.processor.process(spec);

      // Load Mustache template
      const templatePath = path.join(__dirname, 'templates', 'main.mustache');
      const template = fs.readFileSync(templatePath, 'utf8');

      // Render template with data
      const markdown = Mustache.render(template, data);

      // Write output
      fs.writeFileSync(outputPath, markdown, 'utf8');
      console.log(`✅ Markdown documentation generated: ${outputPath}`);

      // Calculate file size
      const stats = fs.statSync(outputPath);
      const fileSize = stats.size;

      return {
        success: true,
        outputPath: outputPath,
        size: fileSize,
        stats: {
          outputPath: outputPath,
          fileSize: fileSize,
          endpoints: data.endpoints?.length || 0,
          resources: data.resources?.length || 0
        }
      };
    } catch (error) {
      console.error(`❌ Markdown generation failed: ${error.message}`);
      return {
        success: false,
        outputPath: null,
        size: 0,
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

  // Additional methods removed - using simplified standalone approach
}

// Export class only
export { MarkdownGenerator };
export default MarkdownGenerator;
