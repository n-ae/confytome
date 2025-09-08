/**
 * Generic Postman Collection Generator
 *
 * Generates Postman collections and environment variables from OpenAPI specifications.
 * Creates generic, reusable collections without project-specific logic.
 */

import fs from 'node:fs';
import path from 'node:path';
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';
import { getOutputDir } from '@confytome/core/constants.js';

// Create Postman environment from OpenAPI spec
function createPostmanEnvironment(openApiSpec) {
  const serverUrl = openApiSpec.servers?.[0]?.url || 'http://localhost:3000';

  return {
    id: generateUUID(),
    name: openApiSpec.info.title?.toUpperCase().replace(/\s+/g, '_') || 'API_ENVIRONMENT',
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
        value: openApiSpec.info.version || '1.0.0',
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
      }
    ],
    _postman_variable_scope: 'environment',
    _postman_exported_at: new Date().toISOString(),
    _postman_exported_using: 'Generated from OpenAPI spec via Confytome'
  };
}

// Generate a simple UUID for Postman
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate Postman collection from OpenAPI spec
function generatePostmanCollection(openApiSpec) {
  const { info, paths, servers } = openApiSpec;

  return {
    info: {
      _postman_id: generateUUID(),
      name: `${info.title} v${info.version}`,
      description: info.description || `API collection for ${info.title}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      {
        name: 'API Endpoints',
        item: generateRequests(paths, servers)
      }
    ],
    variable: [
      {
        key: 'authToken',
        value: '',
        type: 'string',
        description: 'Authentication token'
      }
    ]
  };
}

// Generate requests from OpenAPI paths
function generateRequests(paths, servers = []) {
  const requests = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== 'object' || !operation) continue;

      const request = createPostmanRequest(path, method.toUpperCase(), operation, servers);
      requests.push(request);
    }
  }

  return requests;
}

// Create individual Postman request
function createPostmanRequest(path, method, operation, servers) {
  const serverUrl = servers?.[0]?.url || '{{BASE_URL}}';

  // Convert OpenAPI path parameters to Postman format
  const postmanPath = path.replace(/{([^}]+)}/g, ':$1');

  const request = {
    name: operation.summary || `${method} ${path}`,
    request: {
      method,
      header: [
        {
          key: 'Content-Type',
          value: 'application/json',
          type: 'text'
        }
      ],
      url: {
        raw: `${serverUrl}${postmanPath}`,
        host: [serverUrl],
        path: postmanPath.split('/').filter(Boolean)
      }
    }
  };

  // Add authorization header if security is defined
  if (operation.security || operation.responses) {
    request.request.header.push({
      key: 'Authorization',
      value: 'Bearer {{AUTH_TOKEN}}',
      type: 'text'
    });
  }

  // Add request body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(method) && operation.requestBody) {
    request.request.body = {
      mode: 'raw',
      raw: JSON.stringify(generateExampleBody(operation.requestBody), null, 2),
      options: {
        raw: {
          language: 'json'
        }
      }
    };
  }

  // Add query parameters
  if (operation.parameters) {
    const queryParams = operation.parameters
      .filter(param => param.in === 'query')
      .map(param => ({
        key: param.name,
        value: param.example || generateExampleValue(param.schema),
        description: param.description
      }));

    if (queryParams.length > 0) {
      request.request.url.query = queryParams;
    }
  }

  // Add tests for common response codes
  if (operation.responses) {
    request.request.test = generatePostmanTests(operation.responses);
  }

  return request;
}

// Generate example request body
function generateExampleBody(requestBody) {
  if (!requestBody?.content?.['application/json']?.schema) {
    return {};
  }

  const schema = requestBody.content['application/json'].schema;
  return generateExampleFromSchema(schema);
}

// Generate example value from schema
function generateExampleFromSchema(schema) {
  if (schema.example) return schema.example;

  switch (schema.type) {
  case 'object':
    const obj = {};
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        obj[key] = generateExampleFromSchema(prop);
      }
    }
    return obj;
  case 'array':
    return schema.items ? [generateExampleFromSchema(schema.items)] : [];
  case 'string':
    return schema.enum?.[0] || 'string';
  case 'number':
  case 'integer':
    return 0;
  case 'boolean':
    return false;
  default:
    return null;
  }
}

// Generate example value for parameters
function generateExampleValue(schema) {
  if (!schema) return '';

  if (schema.example !== undefined) return schema.example;

  switch (schema.type) {
  case 'string': return schema.enum?.[0] || 'example';
  case 'number':
  case 'integer': return 1;
  case 'boolean': return true;
  default: return '';
  }
}

// Generate Postman tests
function generatePostmanTests(responses) {
  const tests = [];

  if (responses['200'] || responses['201']) {
    tests.push('pm.test("Status code is successful", function () {');
    tests.push('    pm.expect(pm.response.code).to.be.oneOf([200, 201]);');
    tests.push('});');
  }

  tests.push('pm.test("Response time is less than 5000ms", function () {');
  tests.push('    pm.expect(pm.response.responseTime).to.be.below(5000);');
  tests.push('});');

  return tests.join('\n');
}

class PostmanGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    super('generate-postman', 'Generating Postman collection and environment (OpenAPI spec agnostic)', outputDir, services);
  }

  /**
   * Get generator metadata (implements IGenerator interface)
   * @returns {GeneratorMetadata}
   */
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'postman',
      'Postman collection and environment generator',
      'PostmanGenerator',
      ['api-postman.json', 'api-postman-env.json']
    );
  }

  // Uses base class validation - no override needed

  // Uses base class initialization - no override needed

  async generate(_options = {}) {
    try {
      // Load OpenAPI spec
      const openApiSpec = this.loadOpenAPISpec();

      // Generate Postman collection
      console.log('📥 Generating Postman collection...');
      const collection = generatePostmanCollection(openApiSpec);

      // Write collection file
      const collectionPath = path.join(this.outputDir, 'api-postman.json');
      this.writeOutputFile(
        collectionPath,
        JSON.stringify(collection, null, '\t'),
        'Postman collection created'
      );

      // Generate environment variables
      console.log('🌍 Generating environment variables...');
      const environment = createPostmanEnvironment(openApiSpec);
      const envPath = path.join(this.outputDir, 'api-postman-env.json');
      this.writeOutputFile(
        envPath,
        JSON.stringify(environment, null, '\t'),
        'Environment variables created'
      );

      // Calculate stats
      this.calculateStats(openApiSpec, collectionPath, envPath);

      return {
        success: true,
        outputs: [collectionPath, envPath],
        stats: {
          collectionPath,
          environmentPath: envPath,
          requestCount: Object.keys(openApiSpec.paths || {}).length,
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

  calculateStats(spec, collectionPath, envPath) {
    const pathCount = Object.keys(spec.paths || {}).length;
    let endpointCount = 0;

    for (const path in spec.paths || {}) {
      endpointCount += Object.keys(spec.paths[path]).length;
    }

    this.addStat('API paths', pathCount);
    this.addStat('Total endpoints', endpointCount);
    this.addStat('Collection size', `${(fs.statSync(collectionPath).size / 1024).toFixed(1)} KB`);
    this.addStat('Environment size', `${(fs.statSync(envPath).size / 1024).toFixed(1)} KB`);
  }

  getSuccessMessage() {
    return 'Postman collection and environment generation completed';
  }
}

// Export class only
export { PostmanGenerator };
export default PostmanGenerator;
