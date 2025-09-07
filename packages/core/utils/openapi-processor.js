/**
 * OpenAPI Processor for Mustache Templates
 *
 * Processes OpenAPI 3.0.3 specifications into data structures
 * that can be consumed by logic-less Mustache templates.
 */

export class OpenApiProcessor {
  constructor(options = {}) {
    this.options = {
      includeCodeSamples: true,
      baseUrl: '',
      excludeBrand: false,
      version: 'unknown',
      ...options
    };
  }

  /**
   * Process OpenAPI spec into template data
   * @param {Object} spec - OpenAPI 3.0.3 specification
   * @returns {Object} Data structure for Mustache template
   */
  process(spec) {
    const data = {
      info: this.processInfo(spec.info),
      servers: this.processServers(spec.servers),
      hasAuth: this.hasAuthentication(spec),
      endpoints: this.processEndpoints(spec.paths, spec),
      resources: this.groupEndpointsByTag(spec.paths, spec),
      schemas: this.processSchemas(spec.components?.schemas),
      excludeBrand: this.options.excludeBrand,
      version: this.options.version,
      timestamp: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      })
    };

    // Set base URL for code samples
    data.baseUrl = this.getBaseUrl(spec.servers);

    return data;
  }

  processInfo(info) {
    return {
      title: info?.title || 'API Documentation',
      version: info?.version || '1.0.0',
      description: info?.description,
      contact: info?.contact ? {
        name: info.contact.name || 'Support',
        email: info.contact.email,
        url: info.contact.url
      } : null,
      license: info?.license ? {
        name: info.license.name,
        url: info.license.url
      } : null
    };
  }

  processServers(servers) {
    if (!servers || !servers.length) return null;

    return {
      servers: servers.map(server => ({
        url: server.url,
        description: server.description || 'Server'
      }))
    };
  }

  hasAuthentication(spec) {
    return !!(spec.components?.securitySchemes &&
              Object.keys(spec.components.securitySchemes).length > 0);
  }

  processEndpoints(paths, spec) {
    const endpoints = [];

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
          const endpoint = this.processOperation(path, method, operation, spec);
          endpoints.push(endpoint);
        }
      }
    }

    return endpoints;
  }

  processOperation(path, method, operation, spec) {
    const summary = operation.summary || `${method.toUpperCase()} ${path}`;

    return {
      method: method.toUpperCase(),
      path,
      summary,
      description: operation.description,
      anchor: this.createAnchor(summary),
      parameters: this.processParameters(operation.parameters, path),
      requestBody: this.processRequestBody(operation.requestBody),
      responses: this.processResponses(operation.responses),
      baseUrl: this.getBaseUrl(operation.servers || spec.servers),
      queryString: this.buildQueryString(operation.parameters),
      hasContentType: this.hasRequestBody(operation.requestBody),
      headers: this.getHeaders(operation.parameters),
      requestBodyExample: this.getRequestBodyExample(operation.requestBody)
    };
  }

  groupEndpointsByTag(paths, spec) {
    const resources = {};

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
          const tags = operation.tags || ['Default'];
          const tag = tags[0];

          if (!resources[tag]) {
            resources[tag] = {
              name: tag,
              description: this.getTagDescription(tag, spec.tags),
              endpoints: []
            };
          }

          resources[tag].endpoints.push(this.processOperation(path, method, operation, spec));
        }
      }
    }

    return Object.values(resources);
  }

  processParameters(parameters, _path) {
    if (!parameters || !parameters.length) return null;

    return {
      parameters: parameters.map(param => ({
        name: param.name,
        in: param.in,
        type: this.getParameterType(param.schema),
        required: param.required || false,
        description: param.description || ''
      }))
    };
  }

  processRequestBody(requestBody) {
    if (!requestBody) return null;

    const content = requestBody.content?.['application/json'];
    if (!content) return null;

    return {
      description: requestBody.description,
      example: this.generateExample(content.schema)
    };
  }

  processResponses(responses) {
    if (!responses) return [];

    return Object.entries(responses).map(([code, response]) => ({
      code,
      description: response.description || 'Response',
      example: this.getResponseExample(response)
    }));
  }

  processSchemas(schemas) {
    if (!schemas) return null;

    return {
      models: Object.entries(schemas).map(([name, schema]) => ({
        name,
        description: schema.description,
        example: JSON.stringify(this.generateExample(schema), null, 2),
        properties: this.getSchemaProperties(schema)
      }))
    };
  }

  // Helper methods
  createAnchor(text) {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-çğışüöıİ]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getBaseUrl(servers) {
    if (!servers || !servers.length) return this.options.baseUrl || '';
    return servers[0].url;
  }

  getParameterType(schema) {
    if (!schema) return 'string';
    return schema.type || 'string';
  }

  getTagDescription(tagName, tags) {
    if (!tags) return null;
    const tag = tags.find(t => t.name === tagName);
    return tag?.description;
  }

  buildQueryString(parameters) {
    if (!parameters) return '';

    const queryParams = parameters.filter(p => p.in === 'query');
    if (!queryParams.length) return '';

    const params = queryParams.map(p => `${p.name}=example`).join('&');
    return `?${params}`;
  }

  hasRequestBody(requestBody) {
    return !!(requestBody?.content?.['application/json']);
  }

  getHeaders(parameters) {
    if (!parameters) return null;

    const headerParams = parameters.filter(p => p.in === 'header');
    if (!headerParams.length) return null;

    return {
      headers: headerParams.map(p => ({
        name: p.name,
        example: 'example-value'
      }))
    };
  }

  getRequestBodyExample(requestBody) {
    if (!requestBody?.content?.['application/json']) return null;

    const example = this.generateExample(requestBody.content['application/json'].schema);
    return JSON.stringify(example, null, 0);
  }

  getResponseExample(response) {
    const content = response.content?.['application/json'];
    if (!content) return null;

    const example = this.generateExample(content.schema);
    return example ? JSON.stringify(example, null, 2) : null;
  }

  getSchemaProperties(schema) {
    if (!schema.properties) return null;

    return {
      properties: Object.entries(schema.properties).map(([name, prop]) => ({
        name,
        type: this.getDetailedType(prop),
        description: this.getPropertyDescription(prop)
      }))
    };
  }

  getDetailedType(prop) {
    if (prop.enum) {
      return `${prop.type || 'string'} (enum: ${prop.enum.join(', ')})`;
    }
    if (prop.type === 'array' && prop.items) {
      return `array of ${prop.items.type || 'items'}`;
    }
    if (prop.format) {
      return `${prop.type} (${prop.format})`;
    }
    return prop.type || 'string';
  }

  getPropertyDescription(prop) {
    let desc = prop.description || '';
    if (prop.example !== undefined) {
      desc += desc ? ` (example: ${JSON.stringify(prop.example)})` : `example: ${JSON.stringify(prop.example)}`;
    }
    if (prop.minimum !== undefined || prop.maximum !== undefined) {
      const constraints = [];
      if (prop.minimum !== undefined) constraints.push(`min: ${prop.minimum}`);
      if (prop.maximum !== undefined) constraints.push(`max: ${prop.maximum}`);
      desc += desc ? ` [${constraints.join(', ')}]` : constraints.join(', ');
    }
    return desc;
  }

  generateExample(schema, depth = 0) {
    if (!schema || depth > 3) return null; // Prevent infinite recursion

    if (schema.example !== undefined) {
      return schema.example;
    }

    if (schema.$ref) {
      // Handle schema references
      return this.getDefaultValue('object');
    }

    if (schema.type === 'object' && schema.properties) {
      const example = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.example !== undefined) {
          example[key] = prop.example;
        } else {
          const nestedExample = this.generateExample(prop, depth + 1);
          example[key] = nestedExample !== null ? nestedExample : this.getDefaultValue(prop.type);
        }
      }
      return example;
    }

    if (schema.type === 'array' && schema.items) {
      const itemExample = this.generateExample(schema.items, depth + 1);
      return [itemExample !== null ? itemExample : this.getDefaultValue(schema.items.type)];
    }

    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }

    return this.getDefaultValue(schema.type);
  }

  getDefaultValue(type) {
    switch (type) {
    case 'string': return 'string';
    case 'number': case 'integer': return 0;
    case 'boolean': return true;
    case 'array': return [];
    case 'object': return {};
    default: return 'value';
    }
  }
}

export default OpenApiProcessor;
