/**
 * OpenAPI Specification Processor for Markdown Generation
 *
 * Processes OpenAPI 3.0.x specifications into a structure suitable for
 * Mustache template rendering with Confluence-friendly output.
 */

export class OpenApiProcessor {
  constructor(options = {}) {
    this.options = {
      excludeBrand: false,
      version: 'unknown',
      baseUrl: '',
      ...options
    };
  }

  /**
   * Process OpenAPI specification into template data
   * @param {Object} spec - OpenAPI specification object
   * @returns {Object} Template data structure
   */
  process(spec) {
    const data = {
      info: this.processInfo(spec.info || {}),
      servers: this.processServers(spec.servers || []),
      hasAuth: this.hasAuthentication(spec),
      endpoints: this.processEndpoints(spec.paths || {}),
      resources: this.groupEndpointsByResource(spec.paths || {}),
      schemas: this.processSchemas(spec.components?.schemas || {}),
      excludeBrand: this.options.excludeBrand,
      version: this.options.version,
      timestamp: new Date().toISOString()
    };

    return data;
  }

  /**
   * Process API info section
   * @param {Object} info - OpenAPI info object
   * @returns {Object} Processed info
   */
  processInfo(info) {
    return {
      title: info.title || 'API Documentation',
      version: info.version || '1.0.0',
      description: info.description || '',
      contact: info.contact || null,
      license: info.license || null
    };
  }

  /**
   * Process servers array
   * @param {Array} servers - OpenAPI servers array
   * @returns {Array} Processed servers
   */
  processServers(servers) {
    return servers.map(server => ({
      url: server.url || '',
      description: server.description || server.url || 'Server'
    }));
  }

  /**
   * Check if API has authentication by examining actual route usage
   * @param {Object} spec - OpenAPI specification
   * @returns {boolean} True if any operations actually use authentication
   */
  hasAuthentication(spec) {
    // If no security schemes are defined, there's no authentication
    if (!spec.components?.securitySchemes) {
      return false;
    }

    const hasGlobalSecurity = spec.security?.length > 0;
    const paths = spec.paths || {};

    // Check if any operation uses security
    for (const [_path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          // If operation has explicit security (even empty array), respect that
          if (operation.security !== undefined) {
            if (operation.security.length > 0) {
              return true; // Operation explicitly uses security
            }
            // Operation explicitly disables security with empty array
            continue;
          }

          // If no explicit security on operation, use global security
          if (hasGlobalSecurity) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Process all endpoints for quick reference
   * @param {Object} paths - OpenAPI paths object
   * @returns {Array} Processed endpoints
   */
  processEndpoints(paths) {
    const endpoints = [];

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          const summary = operation.summary || `${method.toUpperCase()} ${path}`;
          endpoints.push({
            method: method.toUpperCase(),
            path,
            summary,
            anchor: this.createAnchor(method, path, summary)
          });
        }
      }
    }

    return endpoints;
  }

  /**
   * Group endpoints by resource (first path segment)
   * @param {Object} paths - OpenAPI paths object
   * @returns {Array} Grouped resources
   */
  groupEndpointsByResource(paths) {
    const resources = new Map();

    for (const [path, pathItem] of Object.entries(paths)) {
      const resourceName = this.extractResourceName(path);

      if (!resources.has(resourceName)) {
        resources.set(resourceName, {
          name: resourceName,
          description: `${resourceName} related operations`,
          endpoints: []
        });
      }

      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          const endpoint = {
            method: method.toUpperCase(),
            path,
            summary: operation.summary || `${method.toUpperCase()} ${path}`,
            description: operation.description || '',
            parameters: this.processParameters(operation.parameters || []),
            requestBody: this.processRequestBody(operation.requestBody),
            responses: this.processResponses(operation.responses || {}),
            baseUrl: this.options.baseUrl,
            queryString: this.buildQueryString(operation.parameters || []),
            hasContentType: !!operation.requestBody,
            headers: this.processHeaders(operation.parameters || []),
            requestBodyExample: this.getRequestBodyExample(operation.requestBody)
          };

          resources.get(resourceName).endpoints.push(endpoint);
        }
      }
    }

    return Array.from(resources.values());
  }

  /**
   * Extract resource name from path
   * @param {string} path - API path
   * @returns {string} Resource name
   */
  extractResourceName(path) {
    const segments = path.split('/').filter(segment => segment && !segment.startsWith('{'));
    return segments[0] || 'API';
  }

  /**
   * Process operation parameters
   * @param {Array} parameters - OpenAPI parameters array
   * @returns {Array} Processed parameters
   */
  processParameters(parameters) {
    return parameters
      .filter(param => param.in !== 'header') // Filter out header params for main params table
      .map(param => ({
        name: param.name || '',
        in: param.in || '',
        type: this.getParameterType(param.schema),
        required: param.required || false,
        description: param.description || ''
      }));
  }

  /**
   * Process request body
   * @param {Object} requestBody - OpenAPI requestBody object
   * @returns {Object|null} Processed request body
   */
  processRequestBody(requestBody) {
    if (!requestBody) return null;

    const content = requestBody.content?.['application/json'];
    return {
      description: requestBody.description || '',
      example: content?.example ? JSON.stringify(content.example, null, 2) : null
    };
  }

  /**
   * Process responses
   * @param {Object} responses - OpenAPI responses object
   * @returns {Array} Processed responses
   */
  processResponses(responses) {
    return Object.entries(responses).map(([code, response]) => {
      const content = response.content?.['application/json'];
      return {
        code,
        description: response.description || '',
        example: content?.example ? JSON.stringify(content.example, null, 2) : null
      };
    });
  }

  /**
   * Process schemas/components
   * @param {Object} schemas - OpenAPI schemas object
   * @returns {Object} Processed schemas
   */
  processSchemas(schemas) {
    if (!schemas || Object.keys(schemas).length === 0) {
      return null;
    }

    const models = Object.entries(schemas).map(([name, schema]) => ({
      name,
      description: schema.description || '',
      example: this.generateSchemaExample(schema),
      properties: this.processSchemaProperties(schema.properties || {})
    }));

    return {
      models
    };
  }

  /**
   * Process schema properties
   * @param {Object} properties - Schema properties
   * @returns {Array} Processed properties
   */
  processSchemaProperties(properties) {
    return Object.entries(properties).map(([name, property]) => ({
      name,
      type: property.type || 'object',
      description: property.description || ''
    }));
  }

  /**
   * Generate example for schema
   * @param {Object} schema - Schema object
   * @returns {string} JSON example
   */
  generateSchemaExample(schema) {
    if (schema.example) {
      return JSON.stringify(schema.example, null, 2);
    }

    // Generate basic example based on schema
    const example = this.generateExampleFromSchema(schema);
    return JSON.stringify(example, null, 2);
  }

  /**
   * Generate example object from schema
   * @param {Object} schema - Schema object
   * @returns {Object} Example object
   */
  generateExampleFromSchema(schema) {
    if (schema.type === 'object' && schema.properties) {
      const example = {};
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        example[propName] = this.generateExampleValue(propSchema);
      }
      return example;
    }
    return this.generateExampleValue(schema);
  }

  /**
   * Generate example value based on schema type
   * @param {Object} schema - Property schema
   * @returns {*} Example value
   */
  generateExampleValue(schema) {
    switch (schema.type) {
    case 'string':
      return schema.example || 'string';
    case 'number':
    case 'integer':
      return schema.example || 0;
    case 'boolean':
      return schema.example || true;
    case 'array':
      return [this.generateExampleValue(schema.items || { type: 'string' })];
    case 'object':
      return this.generateExampleFromSchema(schema);
    default:
      return null;
    }
  }

  /**
   * Get parameter type from schema
   * @param {Object} schema - Parameter schema
   * @returns {string} Type string
   */
  getParameterType(schema) {
    if (!schema) return 'string';
    return schema.type || 'string';
  }

  /**
   * Build query string for curl examples
   * @param {Array} parameters - Operation parameters
   * @returns {string} Query string
   */
  buildQueryString(parameters) {
    const queryParams = parameters.filter(param => param.in === 'query');
    if (queryParams.length === 0) return '';

    const queryString = queryParams.map(param => `${param.name}=value`).join('&');
    return `?${queryString}`;
  }

  /**
   * Process header parameters
   * @param {Array} parameters - Operation parameters
   * @returns {Array} Header parameters
   */
  processHeaders(parameters) {
    return parameters
      .filter(param => param.in === 'header')
      .map(param => ({
        name: param.name,
        example: 'value'
      }));
  }

  /**
   * Get request body example for curl
   * @param {Object} requestBody - Request body object
   * @returns {string|null} Request body example
   */
  getRequestBodyExample(requestBody) {
    if (!requestBody) return null;

    const content = requestBody.content?.['application/json'];
    if (!content) return null;

    let example;

    // Use explicit example if available
    if (content.example) {
      example = content.example;
    } else if (content.schema) {
      // Generate example object from schema (not JSON string)
      example = this.generateExampleFromSchema(content.schema);
    } else {
      return null;
    }

    // Return compact JSON string for curl -d parameter (no newlines)
    return JSON.stringify(example);
  }

  /**
   * Create anchor for internal links based on summary
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {string} summary - Operation summary
   * @returns {string} Anchor string
   */
  createAnchor(method, path, summary) {
    // Use summary if available, otherwise fallback to method + path
    const text = summary || `${method.toUpperCase()} ${path}`;
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}
