/**
 * Standalone Postman Collection Generator
 *
 * Truly independent implementation with zero external dependencies.
 * Can run via "npx @confytome/postman" without any core package dependencies.
 * Generates Postman collections and environment variables from OpenAPI specs.
 */

import path from 'node:path';
import { StandaloneBase } from '@confytome/core/utils/StandaloneBase.js';

export class StandalonePostmanGenerator extends StandaloneBase {
  constructor(outputDir = './confytome', options = {}) {
    super(outputDir, options);
  }

  /**
   * Get generator metadata (self-contained)
   * @returns {Object} Generator metadata
   */
  static getMetadata() {
    return {
      name: 'postman',
      description: 'Postman collection and environment generator for API testing',
      version: '1.9.9',
      packageName: '@confytome/postman',
      cliCommand: 'confytome-postman',
      inputs: ['api-spec.json'],
      outputs: ['postman-collection.json', 'postman-environment.json'],
      features: ['postman-collections', 'environment-variables', 'api-testing', 'examples']
    };
  }

  /**
   * Initialize the generator (extends base initialization)
   * @param {Object} options - Initialization options
   * @returns {Promise<ValidationResult>} Initialization result
   */
  async initialize(options = {}) {
    const baseInit = await super.initialize(options);

    this.log('Postman collection generator initialized');

    return baseInit;
  }

  /**
   * Generate Postman collection and environment
   * @param {Object} _options - Generation options
   * @returns {Promise<GenerationResult>} Generation result
   */
  async generate(_options = {}) {
    this.log('📮 Generating Postman collection and environment...');

    try {
      // Load and parse OpenAPI spec using base class method
      const spec = this.loadOpenAPISpec();

      // Generate collection and environment
      const collection = this.createPostmanCollection(spec);
      const environment = this.createPostmanEnvironment(spec);

      // Write collection file
      const collectionResult = this.writeOutputFile(
        'postman-collection.json',
        JSON.stringify(collection, null, 2),
        'Postman collection generated'
      );

      // Write environment file
      const environmentResult = this.writeOutputFile(
        'postman-environment.json',
        JSON.stringify(environment, null, 2),
        'Postman environment generated'
      );

      // Calculate combined stats
      if (collectionResult.success && environmentResult.success) {
        const totalSize = collectionResult.size + environmentResult.size;
        const stats = {
          collection: {
            path: collectionResult.outputPath,
            size: collectionResult.size
          },
          environment: {
            path: environmentResult.outputPath,
            size: environmentResult.size
          },
          endpoints: this.countEndpoints(spec),
          environments: environment.values.length,
          totalSize
        };

        return {
          success: true,
          outputPath: path.dirname(collectionResult.outputPath),
          size: totalSize,
          stats
        };
      } else {
        throw new Error('Failed to generate one or more files');
      }

    } catch (error) {
      this.log(`Postman generation failed: ${error.message}`, 'error');
      return {
        success: false,
        outputPath: null,
        size: 0,
        stats: { error: error.message }
      };
    }
  }

  /**
   * Create Postman collection from OpenAPI spec
   * @param {Object} openApiSpec - OpenAPI specification
   * @returns {Object} Postman collection
   */
  createPostmanCollection(openApiSpec) {
    const info = openApiSpec.info || {};
    const baseUrl = this.getBaseUrl(openApiSpec.servers) || 'http://localhost:3000';

    const collection = {
      info: {
        _postman_id: this.generateUUID(),
        name: `${info.title || 'API'} v${info.version || '1.0.0'}`,
        description: info.description || 'Generated from OpenAPI specification',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        _exporter_id: this.generateUUID(),
        _collection_link: this.generateBranding('json')
      },
      item: this.processEndpoints(openApiSpec.paths || {}, baseUrl),
      auth: this.generateAuth(openApiSpec.components?.securitySchemes),
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl,
          type: 'string'
        }
      ]
    };

    return collection;
  }

  /**
   * Create Postman environment from OpenAPI spec
   * @param {Object} openApiSpec - OpenAPI specification
   * @returns {Object} Postman environment
   */
  createPostmanEnvironment(openApiSpec) {
    const serverUrl = this.getBaseUrl(openApiSpec.servers) || 'http://localhost:3000';
    const info = openApiSpec.info || {};

    return {
      id: this.generateUUID(),
      name: `${info.title?.toUpperCase().replace(/\s+/g, '_') || 'API'}_ENVIRONMENT`,
      values: [
        {
          key: 'BASE_URL',
          value: serverUrl,
          type: 'default',
          description: 'API base URL from OpenAPI spec',
          enabled: true
        },
        {
          key: 'API_VERSION',
          value: info.version || '1.0.0',
          type: 'default',
          description: 'API version',
          enabled: true
        },
        {
          key: 'AUTH_TOKEN',
          value: 'your_auth_token_here',
          type: 'secret',
          description: 'Authentication token (configure in your environment)',
          enabled: true
        },
        {
          key: 'CONTENT_TYPE',
          value: 'application/json',
          type: 'default',
          description: 'Default content type for requests',
          enabled: true
        }
      ],
      _postman_variable_scope: 'environment',
      _postman_exported_at: new Date().toISOString(),
      _postman_exported_using: this.generateBranding('json')
    };
  }

  /**
   * Process OpenAPI endpoints into Postman items
   */
  processEndpoints(paths, baseUrl) {
    const folders = new Map();

    Object.entries(paths).forEach(([pathName, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

      methods.forEach(method => {
        if (pathItem[method]) {
          const operation = pathItem[method];
          const tags = operation.tags || ['default'];
          const tag = tags[0]; // Use first tag for grouping

          if (!folders.has(tag)) {
            folders.set(tag, {
              name: tag,
              item: []
            });
          }

          const item = this.createPostmanItem(pathName, method, operation, baseUrl);
          folders.get(tag).item.push(item);
        }
      });
    });

    // Convert folders map to array
    return Array.from(folders.values());
  }

  /**
   * Create a Postman item from an OpenAPI operation
   */
  createPostmanItem(pathName, method, operation, _baseUrl) {
    const url = `{{BASE_URL}}${pathName}`;

    return {
      name: operation.summary || `${method.toUpperCase()} ${pathName}`,
      request: {
        method: method.toUpperCase(),
        header: this.generateHeaders(operation),
        body: this.generateRequestBody(operation.requestBody),
        url: {
          raw: url,
          host: ['{{BASE_URL}}'],
          path: pathName.split('/').filter(p => p !== ''),
          query: this.generateQueryParams(operation.parameters)
        },
        description: operation.description || ''
      },
      response: this.generateExampleResponses(operation.responses)
    };
  }

  /**
   * Generate headers for the request
   */
  generateHeaders(operation) {
    const headers = [
      {
        key: 'Content-Type',
        value: '{{CONTENT_TYPE}}',
        type: 'text'
      }
    ];

    // Add auth header if security is specified
    if (operation.security) {
      headers.push({
        key: 'Authorization',
        value: 'Bearer {{AUTH_TOKEN}}',
        type: 'text'
      });
    }

    return headers;
  }

  /**
   * Generate request body from OpenAPI requestBody
   */
  generateRequestBody(requestBody) {
    if (!requestBody || !requestBody.content) return undefined;

    const contentType = Object.keys(requestBody.content)[0];
    const schema = requestBody.content[contentType]?.schema;

    if (contentType === 'application/json' && schema) {
      return {
        mode: 'raw',
        raw: JSON.stringify(this.generateExampleFromSchema(schema), null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }

    return undefined;
  }

  /**
   * Generate query parameters
   */
  generateQueryParams(parameters) {
    if (!parameters) return [];

    return parameters
      .filter(param => param.in === 'query')
      .map(param => ({
        key: param.name,
        value: param.example || this.generateExampleValue(param.schema?.type || 'string'),
        description: param.description || ''
      }));
  }

  /**
   * Generate example responses
   */
  generateExampleResponses(responses) {
    if (!responses) return [];

    return Object.entries(responses).map(([statusCode, response]) => ({
      name: `${statusCode} ${response.description || 'Response'}`,
      originalRequest: null, // Will be filled by Postman
      status: response.description || 'Response',
      code: parseInt(statusCode),
      _postman_previewlanguage: 'json',
      header: [],
      cookie: [],
      body: response.content ?
        JSON.stringify(this.generateExampleFromSchema(
          Object.values(response.content)[0]?.schema
        ), null, 2) : ''
    }));
  }

  /**
   * Generate authentication configuration
   */
  generateAuth(securitySchemes) {
    if (!securitySchemes) return undefined;

    // Look for bearer token auth
    const bearerAuth = Object.values(securitySchemes).find(
      scheme => scheme.type === 'http' && scheme.scheme === 'bearer'
    );

    if (bearerAuth) {
      return {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{AUTH_TOKEN}}',
            type: 'string'
          }
        ]
      };
    }

    return undefined;
  }

  /**
   * Generate example value from schema
   */
  generateExampleFromSchema(schema) {
    if (!schema) return {};

    if (schema.example) return schema.example;

    switch (schema.type) {
    case 'object':
      const obj = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, prop]) => {
          obj[key] = this.generateExampleFromSchema(prop);
        });
      }
      return obj;

    case 'array':
      return schema.items ? [this.generateExampleFromSchema(schema.items)] : [];

    case 'string':
      return this.generateExampleValue('string', schema.format);

    case 'number':
    case 'integer':
      return this.generateExampleValue('number');

    case 'boolean':
      return true;

    default:
      return null;
    }
  }

  /**
   * Generate example value by type
   */
  generateExampleValue(type, format) {
    switch (type) {
    case 'string':
      if (format === 'email') return 'user@example.com';
      if (format === 'date') return '2024-01-01';
      if (format === 'date-time') return '2024-01-01T00:00:00Z';
      return 'string';

    case 'number':
      return 123.45;

    case 'integer':
      return 123;

    case 'boolean':
      return true;

    default:
      return 'value';
    }
  }

  /**
   * Count total endpoints
   */
  countEndpoints(spec) {
    if (!spec.paths) return 0;

    return Object.values(spec.paths).reduce((total, pathItem) => {
      return total + Object.keys(pathItem).filter(method =>
        ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)
      ).length;
    }, 0);
  }

  /**
   * Generate a simple UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
