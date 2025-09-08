/**
 * CLI Template Data Provider
 *
 * Provides standardized template data for CLI descriptions and help text
 * to eliminate repetition across generator packages.
 */

export const CLI_TEMPLATES = {
  // Standard CLI descriptions for each generator type
  descriptions: {
    html: 'Generate professional styled HTML documentation from OpenAPI specs',
    markdown: 'Generate Confluence-friendly Markdown documentation from OpenAPI specs',
    swagger: 'Generate interactive Swagger UI documentation from OpenAPI specs',
    postman: 'Generate Postman collections and environment variables from OpenAPI specs'
  },

  // Common CLI options that all generators share
  commonOptions: [
    {
      flag: '-c, --config <path>',
      description: 'Path to confytome.json config file',
      defaultValue: 'DEFAULT_CONFIG_FILES.CONFYTOME'
    },
    {
      flag: '-o, --output <path>',
      description: 'Output directory for generated files',
      defaultValue: 'DEFAULT_OUTPUT_DIR'
    },
    {
      flag: '--spec <path>',
      description: 'Path to existing OpenAPI spec (if available)',
      defaultValue: null
    },
    {
      flag: '--no-brand',
      description: 'Exclude confytome branding from generated documentation',
      defaultValue: null
    }
  ],

  // Detailed generator information for documentation
  generatorInfo: {
    html: {
      name: 'HTML Generator',
      description: 'Professional styled HTML documentation generator',
      outputFormat: 'html',
      features: [
        'Professional styling with responsive design',
        'Mobile-first layout',
        'Organized by tags with color-coded methods',
        'Self-contained single HTML file',
        'Print-friendly styling'
      ],
      outputFiles: ['api-docs.html'],
      dependencies: ['commander'],
      className: 'SimpleDocsGenerator'
    },
    markdown: {
      name: 'Markdown Generator',
      description: 'Confluence-friendly Markdown documentation generator using Mustache',
      outputFormat: 'markdown',
      features: [
        'Confluence-friendly formatting without HTML tags',
        'Custom Mustache templates with logic-less design',
        'Unicode support for international content',
        'Code samples with cURL examples',
        'Timestamped generation metadata'
      ],
      outputFiles: ['api-docs.md'],
      dependencies: ['commander', 'mustache'],
      className: 'MarkdownGenerator'
    },
    swagger: {
      name: 'Swagger UI Generator',
      description: 'Interactive Swagger UI documentation generator',
      outputFormat: 'html',
      features: [
        'Interactive Swagger UI interface',
        'Self-contained with embedded assets',
        'Responsive design for all devices',
        'Deep linking support',
        'Professional Swagger UI styling'
      ],
      outputFiles: ['api-swagger.html'],
      dependencies: ['commander', 'swagger-ui-dist'],
      className: 'SwaggerUIGenerator'
    },
    postman: {
      name: 'Postman Generator',
      description: 'Postman collections and environment variables generator',
      outputFormat: 'json',
      features: [
        'Complete Postman collections with all endpoints',
        'Environment variables with base URLs',
        'Built-in test scripts for validation',
        'Authentication support',
        'Request examples with sample data'
      ],
      outputFiles: ['api-postman.json', 'api-postman-env.json'],
      dependencies: ['commander'],
      className: 'PostmanGenerator'
    }
  }
};

/**
 * Get CLI template data for a specific generator
 * @param {string} generatorType - Type of generator (html, markdown, swagger, postman)
 * @returns {Object} Template data for the generator
 */
export function getCLITemplateData(generatorType) {
  if (!CLI_TEMPLATES.descriptions[generatorType]) {
    throw new Error(`Unknown generator type: ${generatorType}`);
  }

  return {
    generatorType,
    description: CLI_TEMPLATES.descriptions[generatorType],
    options: CLI_TEMPLATES.commonOptions,
    info: CLI_TEMPLATES.generatorInfo[generatorType]
  };
}

/**
 * Generate CLI option definitions for commander.js
 * @param {string} generatorType - Type of generator
 * @returns {Array} Array of option definitions
 */
export function generateCLIOptions(generatorType) {
  const templateData = getCLITemplateData(generatorType);
  return templateData.options.map(option => ({
    ...option,
    // Resolve default value references
    defaultValue: option.defaultValue?.startsWith('DEFAULT_')
      ? option.defaultValue
      : option.defaultValue
  }));
}

export default { CLI_TEMPLATES, getCLITemplateData, generateCLIOptions };
