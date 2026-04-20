/**
 * README Template Data Provider
 *
 * Enhanced template data for Mustache-based README generation
 * with support for conditionals, loops, and structured data.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function readPackageVersion(packageName) {
  const pkgPath = path.join(rootDir, 'packages', packageName, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  } catch {
    return 'latest';
  }
}

export const README_TEMPLATE_DATA = {
  workspace: {
    template: 'README-workspace.mustache',
    data: {
      projectName: '🔌 confytome',
      badges: [
        {
          name: 'npm version',
          url: 'https://badge.fury.io/js/%40confytome%2Fcore.svg',
          link: 'https://badge.fury.io/js/@confytome/core'
        },
        {
          name: 'License: MIT',
          url: 'https://img.shields.io/badge/License-MIT-yellow.svg',
          link: 'https://opensource.org/licenses/MIT'
        },
        {
          name: 'Node.js Version',
          url: 'https://img.shields.io/badge/node-%3E%3D18-brightgreen',
          link: 'https://nodejs.org/'
        },
        {
          name: 'Code Style: ESM',
          url: 'https://img.shields.io/badge/code%20style-ESM-blue',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'
        }
      ],
      description: 'Plugin-based API documentation generator with OpenAPI-first architecture. Generates multiple formats from JSDoc comments through an extensible generator registry system.',
      tagline: 'Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.'
    }
  },

  core: {
    template: 'README-core.mustache',
    data: {
      packageName: '@confytome/core',
      badges: [
        {
          name: 'npm version',
          url: 'https://badge.fury.io/js/%40confytome%2Fcore.svg',
          link: 'https://badge.fury.io/js/@confytome/core'
        },
        {
          name: 'License: MIT',
          url: 'https://img.shields.io/badge/License-MIT-yellow.svg',
          link: 'https://opensource.org/licenses/MIT'
        },
        {
          name: 'Node.js Version',
          url: 'https://img.shields.io/badge/node-%3E%3D18-brightgreen',
          link: 'https://nodejs.org/'
        },
        {
          name: 'Code Style: ESM',
          url: 'https://img.shields.io/badge/code%20style-ESM-blue',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'
        }
      ],
      description: 'Core plugin system and OpenAPI 3.0.3 generator from JSDoc comments. Plugin registry, service layer, and CLI for extensible API documentation generation.',
      architectureType: 'Plugin-First',
      architectureDescription: 'plugin-based approach with automatic discovery and dependency injection',
      cliCommand: 'confytome',
      packageDir: 'core',
      tagline: 'Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.'
    }
  }
};

/**
 * Generate README template data for a generator package
 * @param {string} generatorType - Type of generator (html, markdown, swagger, postman)
 * @returns {Object} Template data for Mustache rendering
 */
export function getREADMETemplateData(generatorType) {
  const commonOptions = [
    { flag: '--spec', short: '-s', description: 'Path to OpenAPI spec file', default: './confytome/api-spec.json' },
    { flag: '--output', short: '-o', description: 'Output directory for generated files', default: './confytome' },
    { flag: '--version', short: '-V', description: 'Show version number', default: '' },
    { flag: '--help', short: '-h', description: 'Show help information', default: '' }
  ];

  const generatorData = {
    html: {
      packageName: '@confytome/html',
      description: 'Professional styled HTML documentation generator for confytome. Generates clean, responsive HTML documentation from OpenAPI specifications with modern styling and navigation.',
      packageType: 'HTML',
      supportsConfig: false,
      features: [
        '🎨 **Professional Styling** - Clean, modern design with responsive layout',
        '📱 **Mobile-First Design** - Works perfectly on desktop, tablet, and mobile',
        '🏷️ **Organized by Tags** - Groups endpoints by API sections for easy navigation',
        '🎯 **Method Color Coding** - Visual distinction for GET, POST, PUT, DELETE operations',
        '📄 **Self-contained** - Single HTML file with embedded CSS and no external dependencies',
        '🌍 **Unicode Support** - Full international character support',
        '🖨️ **Print-friendly** - Optimized for both screen and print media'
      ],
      outputDescription: 'Creates `api-docs.html` in the specified output directory - a professional HTML documentation file with:\n- API information panel with version and contact details\n- Server configuration display\n- Organized endpoint documentation grouped by tags\n- Parameter details with types and validation\n- Response code documentation\n- Print-friendly styling',
      dependencies: [
        { name: 'commander', description: 'CLI argument parsing' }
      ],
      additionalOptions: [
        { flag: '--no-brand', short: '', description: 'Exclude confytome branding from documentation', default: '' }
      ],
      outputExamples: {
        fileStructure: [
          { file: 'api-docs.html', description: 'Professional HTML documentation (~12KB)' },
          { file: 'api-spec.json', description: 'OpenAPI spec (copied from source)' }
        ],
        features: [
          '**Color-coded HTTP methods** (GET=green, POST=blue, PUT=yellow, DELETE=red)',
          '**Collapsible sections** for better organization',
          '**Syntax highlighting** for code elements',
          '**Responsive navigation** for large APIs',
          '**Information panels** for API metadata'
        ]
      }
    },

    markdown: {
      packageName: '@confytome/markdown',
      description: 'Standalone Markdown documentation generator for confytome. Generates Confluence-friendly documentation from OpenAPI specifications using custom Mustache templates with Turkish Unicode support.',
      packageType: 'Markdown',
      supportsConfig: true,
      features: [
        '📝 **Confluence-friendly Markdown** - Clean formatting without HTML tags',
        '🎨 **Custom Mustache Templates** - Professional styling with logic-less templates',
        '🔧 **Automatic OpenAPI Integration** - Seamless spec consumption',
        '📊 **Code Samples & Examples** - cURL requests and response examples',
        '🌍 **Unicode Support** - Full Turkish and international character support',
        '⚡ **Standalone Operation** - Works with existing OpenAPI specs',
        '🕐 **Timestamped Documentation** - Generation metadata included'
      ],
      outputDescription: 'Creates `api-docs.md` in the specified output directory with:\n\n- API overview and server information\n- All endpoints with request/response examples\n- Data models and schemas\n- Timestamp and generation info',
      dependencies: [
        { name: 'commander', description: 'CLI argument parsing' },
        { name: 'mustache', description: 'Markdown template processing engine' }
      ],
      additionalOptions: [
        { flag: '--config', short: '-c', description: 'Server config JSON file (for generating spec from JSDoc)', default: '' },
        { flag: '--files', short: '-f', description: 'JSDoc files to process', default: '' },
        { flag: '--no-brand', short: '', description: 'Exclude confytome branding from documentation', default: '' },
        { flag: '--no-url-encode', short: '', description: 'Disable URL encoding for anchor links', default: '' }
      ],
      outputExamples: {
        fileStructure: [
          { file: 'api-docs.md        # Main markdown documentation', description: '' },
          { file: 'api-spec.json      # OpenAPI spec (copied from source)', description: '' }
        ],
        features: [
          '**Quick Reference** - Table of contents with anchor links',
          '**Server Information** - Base URLs and environment details',
          '**Endpoint Documentation** - Complete request/response details',
          '**Schema Definitions** - Data model documentation',
          '**Code samples** - Ready-to-use cURL examples'
        ]
      },
      troubleshooting: [
        {
          issue: 'Templates not found',
          solution: 'Ensure Mustache templates are in the templates/ directory. Default templates are included with the package.'
        }
      ]
    },

    swagger: {
      packageName: '@confytome/swagger',
      description: 'Interactive Swagger UI generator for confytome. Generates self-contained Swagger UI documentation from OpenAPI specifications with responsive design and embedded assets.',
      packageType: 'Swagger UI',
      supportsConfig: false,
      features: [
        '🎨 **Interactive Swagger UI** - Full-featured API explorer interface',
        '📱 **Responsive Design** - Works on desktop, tablet, and mobile devices',
        '🎯 **Self-contained** - Single HTML file with all assets embedded (~1.9MB)',
        '🔒 **Documentation Mode** - Displays spec without making actual API calls',
        '🌍 **Unicode Support** - Supports international characters and languages',
        '🔗 **Deep Linking** - Direct links to specific endpoints',
        '⚡ **Fast Loading** - Optimized bundle with minimal dependencies'
      ],
      outputDescription: 'Creates `api-swagger.html` in the specified output directory - a self-contained interactive Swagger UI interface with:\n- Complete OpenAPI specification embedded\n- Professional Swagger UI styling and responsive layout\n- Interactive interface for exploring endpoints\n- Deep linking support for easy navigation\n- Try-it-out interface (disabled for static documentation)',
      dependencies: [
        { name: 'commander', description: 'CLI argument parsing' },
        { name: 'swagger-ui-dist', description: 'Official Swagger UI distribution' }
      ],
      additionalOptions: [
        { flag: '--no-brand', short: '', description: 'Exclude confytome branding from documentation', default: '' }
      ],
      outputExamples: {
        fileStructure: [
          { file: 'api-swagger.html', description: 'Self-contained Swagger UI (~1.9MB)' },
          { file: 'api-spec.json', description: 'OpenAPI spec (copied from source)' }
        ],
        features: [
          '**Endpoint Explorer** - Expandable sections for each API endpoint',
          '**Schema Browser** - Interactive data model exploration',
          '**Response Examples** - Sample responses for each endpoint',
          '**Parameter Documentation** - Detailed input requirements',
          '**Authentication Info** - Security scheme documentation'
        ]
      },
      troubleshooting: [
        {
          issue: 'Large file size (~1.9MB)',
          solution: 'The generated HTML file includes the complete Swagger UI bundle for offline usage. This is intentional for self-contained documentation.'
        }
      ]
    },

    postman: {
      packageName: '@confytome/postman',
      description: 'Postman collection generator for confytome. Generates Postman collections and environment variables from OpenAPI specifications for comprehensive API testing and development workflows.',
      packageType: 'Postman collection',
      supportsConfig: false,
      features: [
        '📥 **Complete Postman Collections** - Ready-to-import collection with all API endpoints',
        '🌍 **Environment Variables** - Pre-configured environment with base URLs and auth tokens',
        '🧪 **Built-in Tests** - Automatic status code and response time validation',
        '📋 **Request Examples** - Sample request bodies and query parameters',
        '🔐 **Authentication Support** - Bearer token and API key authentication setup',
        '🎯 **Path Parameters** - Automatic conversion from OpenAPI to Postman format',
        '📊 **Collection Organization** - Structured by tags and endpoints'
      ],
      outputDescription: 'Creates two files for import into Postman:\n\n### 1. `api-postman.json` - Collection File\n- Complete API request collection with proper naming\n- Request bodies with realistic example data\n- Query parameters with sample values\n- Built-in test scripts for validation\n\n### 2. `api-postman-env.json` - Environment File\n- `BASE_URL` - API base URL from OpenAPI spec\n- `API_VERSION` - API version number\n- `AUTH_TOKEN` - Placeholder for authentication token',
      dependencies: [
        { name: 'commander', description: 'CLI argument parsing' }
      ],
      additionalOptions: [],
      outputExamples: {
        fileStructure: [
          { file: 'api-postman.json', description: 'Postman collection (~8KB)' },
          { file: 'api-postman-env.json', description: 'Environment variables (~1KB)' },
          { file: 'api-spec.json', description: 'OpenAPI spec (copied from source)' }
        ],
        usage: [
          '**Open Postman**',
          '**Import Collection**: File → Import → Select `api-postman.json`',
          '**Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`',
          '**Set Environment**: Select the imported environment from dropdown',
          '**Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`',
          '**Start Testing**: Run individual requests or entire collection'
        ]
      },
      troubleshooting: [
        {
          issue: '"Generated X API requests"',
          solution: 'This shows the number of endpoints successfully converted to Postman requests. Each OpenAPI path/method combination becomes a Postman request.'
        }
      ]
    },

    confluence: {
      packageName: '@confytome/confluence',
      description: 'Confluence-ready Markdown generator for confytome. Generates Pandoc-style Markdown from OpenAPI specifications and copies it to your clipboard for direct paste into Confluence pages.',
      packageType: 'Confluence Markdown',
      supportsConfig: true,
      features: [
        '📋 **Clipboard Integration** - Generated markdown copied to clipboard automatically',
        '📝 **Pandoc-style Markdown** - Clean formatting compatible with Confluence editor',
        '🔧 **Automatic OpenAPI Integration** - Generate spec from JSDoc or use existing',
        '🌍 **Unicode Support** - Full Turkish and international character support',
        '🔗 **Anchor Link Control** - Optional URL encoding for anchor links',
        '⚡ **Standalone Operation** - Works with existing OpenAPI specs',
        '🕐 **Timestamped Documentation** - Generation metadata included'
      ],
      outputDescription: 'Creates `api-docs.md` in the specified output directory and copies the content to your clipboard:\n\n- API overview and server information\n- All endpoints with request/response examples\n- Data models and schemas\n- Ready to paste directly into a Confluence page',
      dependencies: [
        { name: 'commander', description: 'CLI argument parsing' },
        { name: 'clipboardy', description: 'Cross-platform clipboard access' }
      ],
      additionalOptions: [
        { flag: '--config', short: '-c', description: 'Server config JSON file (for generating spec from JSDoc)', default: '' },
        { flag: '--files', short: '-f', description: 'JSDoc files to process', default: '' },
        { flag: '--no-brand', short: '', description: 'Exclude confytome branding from documentation', default: '' },
        { flag: '--no-url-encode', short: '', description: 'Disable URL encoding for anchor links', default: '' },
        { flag: '--no-clipboard', short: '', description: 'Skip copying markdown to clipboard', default: '' }
      ],
      outputExamples: {
        fileStructure: [
          { file: 'api-docs.md', description: 'Confluence-ready Markdown documentation' }
        ],
        features: [
          '**Quick Reference** - Table of contents with anchor links',
          '**Server Information** - Base URLs and environment details',
          '**Endpoint Documentation** - Complete request/response details',
          '**Schema Definitions** - Data model documentation',
          '**Clipboard-ready** - Paste directly into Confluence'
        ]
      }
    }
  };

  const data = generatorData[generatorType];
  if (!data) {
    throw new Error(`Unknown generator type: ${generatorType}`);
  }

  const version = readPackageVersion(generatorType);

  return {
    ...data,
    version,
    encodedPackageName: encodeURIComponent(data.packageName),
    npmBadgeLink: `https://badge.fury.io/js/${data.packageName}`,
    options: [...commonOptions, ...(data.additionalOptions || [])],
    hasTroubleshooting: (data.troubleshooting || []).length > 0
  };
}

export default { README_TEMPLATE_DATA, getREADMETemplateData };
