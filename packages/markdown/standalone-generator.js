/**
 * Standalone Markdown Generator
 *
 * Truly independent implementation with zero external dependencies
 * beyond mustache and commander. Can run via "npx @confytome/markdown"
 * without any core package dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { default as Mustache } from 'mustache';
import { StandaloneBase } from '@confytome/core/utils/StandaloneBase.js';
import { OpenApiProcessor } from '@confytome/core/utils/OpenApiProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StandaloneMarkdownGenerator extends StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    super(outputDir, options);
    this.processor = null;
    this._templateCache = new Map();
  }

  /**
   * Get generator metadata (self-contained)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    return {
      name: 'markdown',
      description: 'Confluence-friendly Markdown documentation generator using Mustache templates',
      version: '1.9.7',
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

    // Validate OpenAPI spec file if specified
    if (this.options.specPath) {
      try {
        this.loadOpenAPISpec(this.options.specPath);
      } catch (error) {
        baseValidation.errors.push(error.message);
      }
    }

    return {
      success: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
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
   * @param {Object} _options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(_options = {}) {
    this.log('📝 Generating Markdown with Mustache templates...');

    try {
      // Load and parse OpenAPI spec using base class method
      const spec = this.loadOpenAPISpec(this.options.specPath);

      // Configure processor options
      const processorOptions = {
        excludeBrand: this.options.excludeBrand,
        version: this.getInfo().version,
        baseUrl: this.getBaseUrl(spec.servers),
        urlEncodeAnchors: this.options.urlEncodeAnchors !== false, // Default to true
        tagOrder: this.options.tagOrder || spec.tags?.map(tag => tag.name) || []
      };

      // Process OpenAPI spec into template data
      this.processor = new OpenApiProcessor(processorOptions);
      let data;
      try {
        data = this.processor.process(spec);
      } catch (processingError) {
        throw new Error(`OpenAPI specification processing failed.\n📁 Spec source: ${this.options.specPath}\n${processingError.message}`);
      }

      // Add branding to template data
      data.excludeBrand = this.options.excludeBrand;
      data.version = this.getInfo().version;
      data.timestamp = this.getTimestamp();

      // Load and cache Mustache template
      const template = this._loadTemplate('main.mustache');

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

  /**
   * Load template with caching for performance
   * @param {string} templateName - Template filename
   * @returns {string} Template content
   */
  _loadTemplate(templateName) {
    if (this._templateCache.has(templateName)) {
      return this._templateCache.get(templateName);
    }

    const templatePath = path.join(__dirname, 'templates', templateName);
    this.validateFileExists(templatePath, 'Mustache template');

    const template = fs.readFileSync(templatePath, 'utf8');
    this._templateCache.set(templateName, template);

    return template;
  }

  // Base class provides getBaseUrl() and cleanup() methods
}
