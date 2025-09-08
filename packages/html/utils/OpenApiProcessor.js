/**
 * OpenAPI Processor for HTML Generation
 *
 * Processes OpenAPI specifications into data structures suitable for HTML rendering.
 * Self-contained without external dependencies.
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
   * Process OpenAPI specification into HTML-ready data
   * @param {Object} openApiSpec - OpenAPI specification
   * @returns {Object} Processed data for HTML generation
   */
  process(openApiSpec) {
    const data = {
      title: openApiSpec.info?.title || 'API Documentation',
      version: openApiSpec.info?.version || '1.0.0',
      description: openApiSpec.info?.description || '',
      baseUrl: this.getBaseUrl(openApiSpec.servers),
      servers: openApiSpec.servers || [],
      endpoints: this.processEndpoints(openApiSpec.paths || {}),
      resources: this.processResources(openApiSpec.paths || {}),
      schemas: this.processSchemas(openApiSpec.components?.schemas || {}),
      excludeBrand: this.options.excludeBrand,
      timestamp: new Date().toISOString()
    };

    return data;
  }

  /**
   * Get base URL from servers
   */
  getBaseUrl(servers) {
    if (!servers || !servers.length) return '';
    return servers[0].url;
  }

  /**
   * Process API endpoints
   */
  processEndpoints(paths) {
    const endpoints = [];

    Object.entries(paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

      methods.forEach(method => {
        if (pathItem[method]) {
          const operation = pathItem[method];
          endpoints.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
            tags: operation.tags || [],
            parameters: this.processParameters(operation.parameters || []),
            requestBody: this.processRequestBody(operation.requestBody),
            responses: this.processResponses(operation.responses || {}),
            operationId: operation.operationId
          });
        }
      });
    });

    return endpoints;
  }

  /**
   * Process resources by grouping endpoints by tags
   */
  processResources(paths) {
    const resources = new Map();

    Object.entries(paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

      methods.forEach(method => {
        if (pathItem[method]) {
          const operation = pathItem[method];
          const tags = operation.tags || ['default'];

          tags.forEach(tag => {
            if (!resources.has(tag)) {
              resources.set(tag, {
                name: tag,
                description: '',
                endpoints: []
              });
            }

            resources.get(tag).endpoints.push({
              path,
              method: method.toUpperCase(),
              summary: operation.summary || '',
              description: operation.description || '',
              operationId: operation.operationId
            });
          });
        }
      });
    });

    return Array.from(resources.values());
  }

  /**
   * Process schema definitions
   */
  processSchemas(schemas) {
    const processedSchemas = {
      models: []
    };

    Object.entries(schemas).forEach(([name, schema]) => {
      processedSchemas.models.push({
        name,
        type: schema.type || 'object',
        description: schema.description || '',
        properties: this.processProperties(schema.properties || {}),
        required: schema.required || [],
        example: schema.example
      });
    });

    return processedSchemas;
  }

  /**
   * Process schema properties
   */
  processProperties(properties) {
    const processed = [];

    Object.entries(properties).forEach(([name, property]) => {
      processed.push({
        name,
        type: property.type || 'string',
        description: property.description || '',
        format: property.format,
        enum: property.enum,
        example: property.example,
        required: false // Will be set by parent schema
      });
    });

    return processed;
  }

  /**
   * Process operation parameters
   */
  processParameters(parameters) {
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      description: param.description || '',
      required: param.required || false,
      type: param.schema?.type || 'string',
      format: param.schema?.format,
      example: param.example || param.schema?.example
    }));
  }

  /**
   * Process request body
   */
  processRequestBody(requestBody) {
    if (!requestBody) return null;

    return {
      description: requestBody.description || '',
      required: requestBody.required || false,
      contentType: Object.keys(requestBody.content || {})[0] || 'application/json',
      schema: requestBody.content ?
        Object.values(requestBody.content)[0]?.schema : null
    };
  }

  /**
   * Process responses
   */
  processResponses(responses) {
    const processed = [];

    Object.entries(responses).forEach(([statusCode, response]) => {
      processed.push({
        statusCode,
        description: response.description || '',
        contentType: Object.keys(response.content || {})[0] || 'application/json',
        schema: response.content ?
          Object.values(response.content)[0]?.schema : null
      });
    });

    return processed;
  }
}
