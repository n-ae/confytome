/**
 * Standalone Markdown Generator
 *
 * Truly independent implementation with zero external dependencies
 * beyond mustache and commander. Can run via "npx @confytome/markdown"
 * without any core package dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { default as Mustache } from 'mustache';
import { StandaloneBase } from './utils/StandaloneBase.js';
import { OpenApiProcessor } from './utils/OpenApiProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StandaloneMarkdownGenerator extends StandaloneBase {
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
      name: 'markdown',
      description: 'Confluence-friendly Markdown documentation generator using Mustache templates',
      version: '1.4.4',
      packageName: '@confytome/markdown',
      cliCommand: 'confytome-markdown',
      inputs: ['api-spec.json'],
      outputs: ['api-docs.md'],
      features: ['confluence-friendly', 'mustache-templates', 'turkish-unicode-support']
    };
  }

  /**
   * Validate generator prerequisites (extends base validation)
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(options = {}) {
    const baseValidation = await super.validate(options);

    // Add template-specific validation
    const templatePath = path.join(__dirname, 'templates', 'main.mustache');
    try {
      this.validateFileExists(templatePath, 'Mustache template');
    } catch (error) {
      baseValidation.errors.push(error.message);
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

    // Add any markdown-specific initialization here
    this.log('Markdown generator initialized');

    return baseInit;
  }

  /**
   * Generate Markdown documentation
   * @param {Object} options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(options = {}) {
    this.log('📝 Generating Markdown with Mustache templates...');

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

      // Add branding to template data
      data.excludeBrand = this.options.excludeBrand;
      data.version = this.getInfo().version;
      data.timestamp = this.getTimestamp();

      // Load Mustache template
      const templatePath = path.join(__dirname, 'templates', 'main.mustache');
      this.validateFileExists(templatePath, 'Mustache template');
      const template = fs.readFileSync(templatePath, 'utf8');

      // Render template with data
      const markdown = Mustache.render(template, data);

      // Write output using base class method
      const result = this.writeOutputFile('api-docs.md', markdown, 'Confluence-ready Markdown documentation created');

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
      this.log(`Markdown generation failed: ${error.message}`, 'error');
      return {
        success: false,
        outputPath: null,
        size: 0,
        stats: { error: error.message }
      };
    }
  }

  // Base class provides getBaseUrl() and cleanup() methods
}
