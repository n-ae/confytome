/**
 * OpenAPI Specification Processor for Markdown Generation
 *
 * Processes OpenAPI 3.1.x specifications into a structure suitable for
 * Mustache template rendering with Confluence-friendly output.
 */

export class OpenApiProcessor {
  constructor(options = {}) {
    this.options = {
      excludeBrand: false,
      version: 'unknown',
      baseUrl: '',
      tagOrder: [],
      ...options
    };

    // Memoization caches for performance
    this._schemaExampleCache = new Map();
    this._schemaTypeCache = new Map();
    this._anchorCache = new Map();
  }

  /**
   * Execute a processing function with enhanced error context
   * @param {string} context - Description of what's being processed
   * @param {Function} processFn - Function to execute
   * @returns {*} Result of processFn
   */
  processWithContext(context, processFn) {
    try {
      return processFn();
    } catch (error) {
      throw new Error(`📍 Context: Processing ${context}\n💥 Error: ${error.message}`);
    }
  }

  /**
   * Process OpenAPI specification into template data
   * @param {Object} spec - OpenAPI specification object
   * @returns {Object} Template data structure
   */
  process(spec) {
    try {
      // Store spec for reference resolution
      this.openApiSpec = spec;

      const data = {
        info: this.processWithContext('info', () => this.processInfo(spec.info || {})),
        servers: this.processWithContext('servers', () => this.processServers(spec.servers || [])),
        hasAuth: this.processWithContext('authentication', () => this.hasAuthentication(spec)),
        endpoints: this.processWithContext('endpoints', () => this.processEndpoints(spec.paths || {})),
        resources: this.processWithContext('resources', () => this.groupEndpointsByResource(spec.paths || {}, spec)),
        schemas: this.processWithContext('schemas', () => this.processSchemas(spec.components?.schemas || {})),
        excludeBrand: this.options.excludeBrand,
        version: this.options.version,
        timestamp: new Date().toISOString(),
        quickReferenceAnchor: this.createAnchor('', '', 'Quick Reference')
      };

      return data;
    } catch (error) {
      throw new Error(`OpenAPI specification processing failed: ${error.message}`);
    }
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
      try {
        for (const [method, operation] of Object.entries(pathItem)) {
          if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
            try {
              const summary = operation.summary || `${method.toUpperCase()} ${path}`;
              endpoints.push({
                method: method.toUpperCase(),
                path,
                summary,
                anchor: this.createAnchor(method, path, summary)
              });
            } catch (error) {
              throw new Error(`📍 Endpoint: ${method.toUpperCase()} ${path}\n💥 Error: ${error.message}`);
            }
          }
        }
      } catch (error) {
        if (error.message.includes('📍 Endpoint:')) {
          throw error; // Re-throw enhanced error
        }
        throw new Error(`📍 Path: ${path}\n💥 Error: ${error.message}`);
      }
    }

    return endpoints;
  }

  /**
   * Group endpoints by tag (first tag)
   * @param {Object} paths - OpenAPI paths object
   * @param {Object} spec - Full OpenAPI specification
   * @returns {Array} Grouped resources
   */
  groupEndpointsByResource(paths, spec) {
    const resources = new Map();

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
          try {
            // Use first tag (tags are required)
            const resourceName = this.getResourceName(path, operation);

            if (!resources.has(resourceName)) {
              const pascalName = this.toPascalCase(resourceName);
              resources.set(resourceName, {
                name: pascalName,
                description: this.getTagDescription(resourceName, spec),
                anchor: this.createAnchor('', '', pascalName),
                endpoints: []
              });
            }
            const endpointSummary = operation.summary || `${method.toUpperCase()} ${path}`;
            const mergedParams = this.mergeParameters(pathItem.parameters, operation.parameters, spec);
            const endpoint = {
              method: method.toUpperCase(),
              path,
              summary: endpointSummary,
              description: operation.description || '',
              anchor: this.createAnchor(method, path, endpointSummary),
              parameters: this.processWithContext(`parameters for ${method.toUpperCase()} ${path}`,
                () => this.processParameters(mergedParams)),
              requestBody: this.processWithContext(`request body for ${method.toUpperCase()} ${path}`,
                () => this.processRequestBody(operation.requestBody)),
              responses: this.processWithContext(`responses for ${method.toUpperCase()} ${path}`,
                () => this.processResponses(operation.responses || {})),
              baseUrl: this.getOperationServerUrl(operation, spec),
              queryString: this.buildQueryString(mergedParams),
              hasContentType: !!operation.requestBody,
              headers: this.processHeaders(mergedParams, operation, spec),
              requestBodyExample: this.getRequestBodyExample(operation.requestBody)
            };

            resources.get(resourceName).endpoints.push(endpoint);
          } catch (error) {
            throw new Error(`📍 Endpoint: ${method.toUpperCase()} ${path}\n💥 Error: ${error.message}`);
          }
        }
      }
    }

    const sortedResources = Array.from(resources.values()).sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Use configured tag order if provided
      const tagOrder = (this.options.tagOrder || []).map(tag => tag.toLowerCase());

      const aIndex = tagOrder.indexOf(aName);
      const bIndex = tagOrder.indexOf(bName);

      // If both are in tagOrder, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only a is in tagOrder, it comes first
      if (aIndex !== -1) return -1;

      // If only b is in tagOrder, it comes first
      if (bIndex !== -1) return 1;

      // Otherwise, sort alphabetically
      return aName.localeCompare(bName);
    });

    return sortedResources;
  }

  /**
   * Get resource name from first tag
   * @param {string} path - API path
   * @param {Object} operation - OpenAPI operation object
   * @returns {string} Resource name
   */
  getResourceName(path, operation) {
    // Use first tag (tags are now required)
    if (operation.tags && operation.tags.length > 0) {
      return operation.tags[0];
    }

    // No fallback - tags are required
    throw new Error(`Operation ${operation.summary || path} must have at least one tag defined`);
  }

  /**
   * Get tag description from OpenAPI spec
   * @param {string} tagName - Tag name
   * @param {Object} spec - Full OpenAPI specification
   * @returns {string} Tag description
   */
  getTagDescription(tagName, spec) {
    if (!spec.tags) return '';

    const tag = spec.tags.find(t => t.name === tagName);
    return tag ? tag.description || '' : '';
  }

  /**
   * Convert string to Pascal Case
   * @param {string} str - String to convert
   * @returns {string} Pascal Case string
   */
  toPascalCase(str) {
    if (!str) return str;

    // Handle kebab-case, snake_case, and regular words
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Process operation parameters
   * @param {Array} parameters - OpenAPI parameters array
   * @returns {Array} Processed parameters
   */
  processParameters(parameters) {
    return parameters
      .map(param => {
        const processedParam = {
          name: param.name || '',
          in: param.in || '',
          type: this.getParameterType(param.schema),
          required: param.required || false,
          description: this.getParameterDescription(param)
        };

        // Extract examples if available
        if (param.examples || param.example || param.schema?.example) {
          processedParam.examples = this.extractParameterExamples(param);
          processedParam.hasExamples = processedParam.examples.length > 0;
        }

        return processedParam;
      });
  }

  /**
   * Extract examples from parameter object
   * @param {Object} param - OpenAPI parameter object
   * @returns {Array} Array of example objects
   */
  extractParameterExamples(param) {
    const examples = [];

    // Handle multiple examples (OpenAPI 3.x format)
    if (param.examples && typeof param.examples === 'object') {
      Object.entries(param.examples).forEach(([key, example]) => {
        let exampleValue;

        // Handle different example formats
        if (example && typeof example === 'object') {
          if (example.value !== undefined) {
            exampleValue = example.value;
          } else if (example.$ref) {
            // Skip $ref examples for now - they need component resolution
            return;
          } else {
            exampleValue = example;
          }
        } else {
          exampleValue = example;
        }

        // Convert objects to JSON string for display
        if (typeof exampleValue === 'object') {
          exampleValue = JSON.stringify(exampleValue, null, 2);
        }

        examples.push({
          name: key,
          summary: example.summary || key,
          description: example.description || '',
          value: exampleValue
        });
      });
    }

    // Handle single example (OpenAPI 2.0 format or simple example)
    if (param.example !== undefined) {
      let exampleValue = param.example;
      if (typeof exampleValue === 'object') {
        exampleValue = JSON.stringify(exampleValue, null, 2);
      }
      examples.push({
        name: 'example',
        summary: 'Example',
        description: 'Parameter example',
        value: exampleValue
      });
    }

    // Handle schema example
    if (param.schema?.example !== undefined) {
      let exampleValue = param.schema.example;
      if (typeof exampleValue === 'object') {
        exampleValue = JSON.stringify(exampleValue, null, 2);
      }
      examples.push({
        name: 'schema_example',
        summary: 'Schema Example',
        description: 'Example from parameter schema',
        value: exampleValue
      });
    }

    return examples;
  }

  /**
   * Process request body
   * @param {Object} requestBody - OpenAPI requestBody object
   * @returns {Object|null} Processed request body
   */
  processRequestBody(requestBody) {
    if (!requestBody) return null;

    // Get all available content types
    const availableContentTypes = Object.keys(requestBody.content || {});
    const preferredContentTypes = ['application/json', 'application/xml', 'text/plain', 'multipart/form-data', 'application/x-www-form-urlencoded'];

    // Find the best content type to use (prefer JSON, then others in order)
    let selectedContentType = null;
    let content = null;

    for (const preferred of preferredContentTypes) {
      if (availableContentTypes.includes(preferred)) {
        selectedContentType = preferred;
        content = requestBody.content[preferred];
        break;
      }
    }

    // If no preferred type found, use the first available
    if (!selectedContentType && availableContentTypes.length > 0) {
      selectedContentType = availableContentTypes[0];
      content = requestBody.content[selectedContentType];
    }

    if (!content) return null;

    let examples = [];
    let properties = [];

    // Process examples - handle both single example and multiple examples
    examples = this.extractAllExamples(content, selectedContentType);

    // Extract properties information for documentation
    if (content.schema?.properties) {
      properties = this.extractSchemaProperties(content.schema);
    }

    return {
      description: requestBody.description || '',
      contentType: selectedContentType,
      examples,
      hasExamples: examples.length > 0,
      properties,
      hasProperties: properties.length > 0,
      availableContentTypes: availableContentTypes.length > 1 ? availableContentTypes : null
    };
  }

  /**
   * Extract all examples from content (handles both single example and multiple examples)
   * @param {Object} content - OpenAPI media type object
   * @param {string} contentType - Content type string
   * @returns {Array} Array of example objects
   */
  extractAllExamples(content, contentType) {
    const examples = [];

    // Handle OpenAPI 3.x multiple examples
    if (content.examples && typeof content.examples === 'object') {
      for (const [name, exampleObj] of Object.entries(content.examples)) {
        examples.push({
          name: name || 'Example',
          summary: exampleObj.summary || '',
          description: exampleObj.description || '',
          value: this.formatExampleValue(exampleObj.value, contentType),
          syntaxLanguage: this.getSyntaxLanguage(contentType)
        });
      }
    }

    // Handle single example
    if (content.example !== undefined) {
      examples.push({
        name: 'Example',
        summary: '',
        description: '',
        value: this.formatExampleValue(content.example, contentType),
        syntaxLanguage: this.getSyntaxLanguage(contentType)
      });
    }

    // Generate example from schema if no explicit examples
    if (examples.length === 0 && content.schema) {
      const generatedExample = this.generateExampleFromSchema(content.schema, 0);
      if (generatedExample !== null) {
        examples.push({
          name: 'Generated Example',
          summary: 'Auto-generated from schema',
          description: '',
          value: this.formatExampleValue(generatedExample, contentType),
          syntaxLanguage: this.getSyntaxLanguage(contentType)
        });
      }
    }

    return examples;
  }

  /**
   * Format example value based on content type
   * @param {*} value - Raw example value
   * @param {string} contentType - Content type
   * @returns {string} Formatted example value
   */
  formatExampleValue(value, contentType) {
    if (value === null || value === undefined) {
      return '';
    }

    switch (contentType) {
    case 'application/json':
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    case 'application/xml':
      return typeof value === 'string' ? value : this.objectToXml(value);
    case 'text/plain':
      return typeof value === 'string' ? value : String(value);
    case 'multipart/form-data':
    case 'application/x-www-form-urlencoded':
      return this.objectToFormData(value);
    default:
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    }
  }

  /**
   * Get syntax highlighting language for content type
   * @param {string} contentType - Content type
   * @returns {string} Syntax highlighting language
   */
  getSyntaxLanguage(contentType) {
    switch (contentType) {
    case 'application/json':
      return 'json';
    case 'application/xml':
      return 'xml';
    case 'text/html':
      return 'html';
    case 'text/css':
      return 'css';
    case 'text/javascript':
    case 'application/javascript':
      return 'javascript';
    case 'text/yaml':
    case 'application/yaml':
      return 'yaml';
    case 'text/plain':
      return 'text';
    default:
      return 'text';
    }
  }

  /**
   * Convert object to simple XML representation
   * @param {Object} obj - Object to convert
   * @returns {string} XML string
   */
  objectToXml(obj, depth = 0) {
    if (depth > 10) return '[Max depth exceeded]'; // Prevent stack overflow
    if (typeof obj !== 'object' || obj === null) return String(obj);

    let xml = '';
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += `<${key}>\n${this.objectToXml(value, depth + 1)}</${key}>\n`;
      } else {
        xml += `<${key}>${value}</${key}>\n`;
      }
    }
    return xml;
  }

  /**
   * Convert object to form data representation
   * @param {Object} obj - Object to convert
   * @returns {string} Form data string
   */
  objectToFormData(obj) {
    if (typeof obj !== 'object') return String(obj);

    const params = [];
    for (const [key, value] of Object.entries(obj)) {
      params.push(`${key}=${encodeURIComponent(value)}`);
    }
    return params.join('&');
  }

  /**
   * Extract properties from schema for documentation
   * @param {Object} schema - JSON Schema object
   * @returns {Array} Array of property objects
   */
  extractSchemaProperties(schema) {
    if (!schema.properties) return [];

    const required = schema.required || [];
    return Object.entries(schema.properties).map(([name, prop]) => ({
      name,
      type: this.getSchemaType(prop),
      required: required.includes(name),
      description: prop.description || ''
    }));
  }

  /**
   * Get schema type with enum values if present
   * @param {Object} schema - Property schema
   * @returns {string} Type description with enum values
   */
  getSchemaType(schema) {
    if (!schema) return 'string';

    const cacheKey = JSON.stringify({ type: schema.type, enum: schema.enum });
    if (this._schemaTypeCache.has(cacheKey)) {
      return this._schemaTypeCache.get(cacheKey);
    }

    let type = schema.type || 'string';

    if (schema.enum && Array.isArray(schema.enum)) {
      const enumValues = schema.enum.map(val => `\`"${val}"\``).join(', ');
      type += ` (${enumValues})`;
    }

    this._schemaTypeCache.set(cacheKey, type);
    return type;
  }

  /**
   * Create cache key for schema objects
   * @param {Object} schema - Schema object
   * @param {number} depth - Recursion depth
   * @returns {string} Cache key
   */
  _createSchemaCacheKey(schema, depth) {
    // Create a lightweight key from schema structure
    return JSON.stringify({
      type: schema.type,
      properties: schema.properties ? Object.keys(schema.properties).sort() : undefined,
      items: schema.items?.type,
      example: schema.example,
      enum: schema.enum,
      depth
    });
  }

  /**
   * Process responses
   * @param {Object} responses - OpenAPI responses object
   * @returns {Array} Processed responses
   */
  processResponses(responses) {
    return Object.entries(responses).map(([code, response]) => {
      // Resolve response $ref if present
      if (response.$ref) {
        response = this.resolveRef(response.$ref, this.openApiSpec) || response;
      }

      // Get all available content types for this response
      const availableContentTypes = Object.keys(response.content || {});
      const preferredContentTypes = ['application/json', 'application/xml', 'text/plain', 'text/html'];

      // Find the best content type to use
      let selectedContentType = null;
      let content = null;

      for (const preferred of preferredContentTypes) {
        if (availableContentTypes.includes(preferred)) {
          selectedContentType = preferred;
          content = response.content[preferred];
          break;
        }
      }

      // If no preferred type found, use the first available
      if (!selectedContentType && availableContentTypes.length > 0) {
        selectedContentType = availableContentTypes[0];
        content = response.content[selectedContentType];
      }

      let examples = [];
      let headers = [];
      let schema = null;
      let properties = null;

      // Process response examples and schema
      if (content && content.schema) {
        // Only extract explicit examples (not auto-generated ones)
        // since we're showing the schema in Response Body section
        const allExamples = this.extractAllExamples(content, selectedContentType);
        examples = allExamples.filter(ex => ex.name !== 'Generated Example');

        // Generate schema example and extract properties
        const resolvedSchema = this.resolveSchemaRef(content.schema);
        if (resolvedSchema) {
          schema = this.generateSchemaExample(resolvedSchema);
          if (resolvedSchema.properties) {
            properties = this.processSchemaProperties(resolvedSchema.properties);
          }
        }
      }

      // Process response headers
      if (response.headers) {
        headers = Object.entries(response.headers).map(([name, header]) => ({
          name,
          description: header.description || '',
          schema: header.schema || null,
          example: header.example || (header.schema?.example) || 'value'
        }));
      }

      return {
        code,
        description: response.description || '',
        contentType: selectedContentType,
        examples,
        hasExamples: examples.length > 0,
        schema,
        hasSchema: schema !== null,
        properties,
        hasProperties: properties && properties.length > 0,
        headers,
        hasHeaders: headers.length > 0,
        availableContentTypes: availableContentTypes.length > 1 ? availableContentTypes : null
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
    const example = this.generateExampleFromSchema(schema, 0);
    return JSON.stringify(example, null, 2);
  }

  /**
   * Generate example object from schema
   * @param {Object} schema - Schema object
   * @param {number} depth - Current recursion depth to prevent stack overflow
   * @returns {Object} Example object
   */
  generateExampleFromSchema(schema, depth = 0) {
    if (depth > 10) return '[Max depth exceeded]'; // Prevent stack overflow

    // Create cache key from schema structure
    const cacheKey = this._createSchemaCacheKey(schema, depth);
    if (this._schemaExampleCache.has(cacheKey)) {
      return this._schemaExampleCache.get(cacheKey);
    }

    let example;
    if (schema.type === 'object' && schema.properties) {
      example = {};
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        example[propName] = this.generateExampleValue(propSchema, depth + 1);
      }
    } else {
      example = this.generateExampleValue(schema, depth);
    }

    // Cache the result
    this._schemaExampleCache.set(cacheKey, example);
    return example;
  }

  /**
   * Generate example value based on schema type
   * @param {Object} schema - Property schema
   * @param {number} depth - Current recursion depth to prevent stack overflow
   * @returns {*} Example value
   */
  generateExampleValue(schema, depth = 0) {
    if (depth > 10) return '[Max depth exceeded]'; // Prevent stack overflow

    // If there's an explicit example, use it regardless of type
    if (schema.example !== undefined) {
      return schema.example;
    }

    switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
    case 'decimal':  // Handle non-standard decimal type
      return 0;
    case 'boolean':
      return true;
    case 'array':
      return [this.generateExampleValue(schema.items || { type: 'string' }, depth + 1)];
    case 'object':
      return this.generateExampleFromSchema(schema, depth + 1);
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

    let type = schema.type || 'string';

    // If schema has enum values, append them to the type
    if (schema.enum && Array.isArray(schema.enum)) {
      const enumValues = schema.enum.map(val => `\`"${val}"\``).join(', ');
      type += ` (${enumValues})`;
    }

    return type;
  }

  /**
   * Get parameter description with enum information
   * @param {Object} param - OpenAPI parameter object
   * @returns {string} Enhanced parameter description
   */
  getParameterDescription(param) {
    let description = param.description || '';

    // Add enum information to description if present
    if (param.schema?.enum && Array.isArray(param.schema.enum)) {
      const enumValues = param.schema.enum.map(val => `\`"${val}"\``).join(', ');
      const enumText = `Allowed values: ${enumValues}`;

      if (description) {
        description += `. ${enumText}`;
      } else {
        description = enumText;
      }
    }

    // Add default value information if present
    if (param.schema?.default !== undefined) {
      const defaultText = `Default: \`"${param.schema.default}"\``;

      if (description) {
        description += `. ${defaultText}`;
      } else {
        description = defaultText;
      }
    }

    return description;
  }

  /**
   * Build query string for curl examples
   * @param {Array} parameters - Operation parameters
   * @returns {string} Query string
   */
  buildQueryString(parameters) {
    const queryParams = parameters.filter(param => param.in === 'query');
    if (queryParams.length === 0) return '';

    const queryString = queryParams.map(param => {
      const value = this.getParameterExampleValue(param);
      return `${param.name}=${value}`;
    }).join('&');
    return `?${queryString}`;
  }

  /**
   * Get example value for parameter in curl samples
   * @param {Object} param - OpenAPI parameter object
   * @returns {string} Example value
   */
  getParameterExampleValue(param) {
    // Use explicit example if available
    if (param.example !== undefined) {
      return param.example;
    }

    // Use schema example if available
    if (param.schema?.example !== undefined) {
      return param.schema.example;
    }

    // Use first enum value if parameter has enum
    if (param.schema?.enum && Array.isArray(param.schema.enum) && param.schema.enum.length > 0) {
      return param.schema.enum[0];
    }

    // Use default value if available
    if (param.schema?.default !== undefined) {
      return param.schema.default;
    }

    // Fallback to generic value
    return 'value';
  }

  /**
   * Process header parameters
   * @param {Array} parameters - Operation parameters
   * @returns {Array} Header parameters
   */
  processHeaders(parameters, operation, spec) {
    const headers = parameters
      .filter(param => param.in === 'header')
      .map(param => ({
        name: param.name,
        example: 'value'
      }));

    // Add authorization headers if operation requires authentication
    // and Authorization header is not already explicitly defined in parameters
    if (this.operationRequiresAuth(operation, spec)) {
      const authHeader = this.getAuthorizationHeader(spec);
      if (authHeader) {
        // Only add if not already present in headers
        const hasAuthHeader = headers.some(h =>
          h.name.toLowerCase() === authHeader.name.toLowerCase()
        );
        if (!hasAuthHeader) {
          headers.push(authHeader);
        }
      }
    }

    return headers;
  }

  /**
   * Check if an operation requires authentication
   * @param {Object} operation - OpenAPI operation
   * @param {Object} spec - OpenAPI specification
   * @returns {boolean} True if operation requires authentication
   */
  operationRequiresAuth(operation, spec) {
    // If operation has explicit security, use that
    if (operation.security !== undefined) {
      return operation.security.length > 0;
    }

    // Check global security (handle both correct and malformed structures)
    if (spec.security && Array.isArray(spec.security) && spec.security.length > 0) {
      return true;
    }

    // Handle malformed security structure (when it ends up in paths)
    if (spec.paths?.security) {
      return true;
    }

    // If we have security schemes defined, assume global auth is required
    if (spec.components?.securitySchemes) {
      return true;
    }

    return false;
  }

  /**
   * Get authorization header based on security schemes
   * @param {Object} spec - OpenAPI specification
   * @returns {Object|null} Authorization header object
   */
  getAuthorizationHeader(spec) {
    const securitySchemes = spec.components?.securitySchemes;
    if (!securitySchemes) return null;

    // Find the first security scheme (prioritize Bearer/JWT)
    for (const [_name, scheme] of Object.entries(securitySchemes)) {
      if (scheme.type === 'http' && scheme.scheme === 'bearer') {
        return {
          name: 'Authorization',
          example: 'Bearer <your-token>'
        };
      }
      if (scheme.type === 'apiKey' && scheme.in === 'header') {
        return {
          name: scheme.name || 'Authorization',
          example: '<your-api-key>'
        };
      }
    }

    // Fallback for generic HTTP auth
    return {
      name: 'Authorization',
      example: 'Bearer <your-token>'
    };
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
      example = this.generateExampleFromSchema(content.schema, 0);
    } else {
      return null;
    }

    // Return compact JSON string for curl -d parameter (no newlines)
    return JSON.stringify(example);
  }

  /**
   * Get the server URL for a specific operation
   * @param {Object} operation - OpenAPI operation
   * @param {Object} spec - OpenAPI specification
   * @returns {string} Server URL
   */
  getOperationServerUrl(operation, spec) {
    // Check if operation has specific servers
    if (operation.servers && operation.servers.length > 0) {
      return operation.servers[0].url;
    }

    // Fall back to global servers
    if (spec.servers && spec.servers.length > 0) {
      return spec.servers[0].url;
    }

    // Final fallback to options baseUrl
    return this.options.baseUrl;
  }

  /**
   * Create anchor for internal links based on summary
   *
   * ⚠️ CRITICAL: UTF CHARACTER PRESERVATION
   * This method has been fixed multiple times due to UTF character handling issues.
   * See .github/ANCHOR_HANDLING_FIX.md for detailed documentation.
   *
   * GOLDEN RULE: Always preserve UTF characters in both modes.
   * The ONLY difference should be case handling.
   *
   * DO NOT USE: [^\w\s-] regex - it removes Turkish, Spanish, Chinese chars!
   *
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {string} summary - Operation summary
   * @returns {string} Anchor string with UTF characters preserved
   */
  createAnchor(method, path, summary) {
    // Use summary if available, otherwise fallback to method + path
    const text = summary || `${method.toUpperCase()} ${path}`;
    const cacheKey = `${text}_${this.options.urlEncodeAnchors}`;

    if (this._anchorCache.has(cacheKey)) {
      return this._anchorCache.get(cacheKey);
    }

    let anchor;
    if (this.options.urlEncodeAnchors === false) {
      // --no-url-encode flag: lowercase, preserve UTF characters
      anchor = text
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    } else {
      // Default behavior: preserve case AND UTF characters for maximum compatibility
      anchor = text
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    this._anchorCache.set(cacheKey, anchor);
    return anchor;
  }

  resolveRef(ref, spec) {
    if (!ref || !ref.startsWith('#/')) {
      return null;
    }

    const parts = ref.substring(2).split('/');
    let current = spec;

    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        return null;
      }
      current = current[part];
    }

    return current;
  }

  resolveSchemaRef(schema) {
    if (!schema) return null;

    // If schema has a $ref, resolve it
    if (schema.$ref) {
      const resolved = this.resolveRef(schema.$ref, this.openApiSpec);
      if (!resolved) return null;
      return this.resolveSchemaRef(resolved);
    }

    // Handle allOf composition by merging schemas
    if (schema.allOf) {
      const merged = { type: 'object', properties: {} };
      for (const subSchema of schema.allOf) {
        const resolved = this.resolveSchemaRef(subSchema);
        if (resolved) {
          if (resolved.properties) {
            merged.properties = { ...merged.properties, ...resolved.properties };
          }
          if (resolved.type && !merged.type) {
            merged.type = resolved.type;
          }
        }
      }
      return merged;
    }

    // For anyOf and oneOf, use the first schema
    if (schema.anyOf && schema.anyOf.length > 0) {
      return this.resolveSchemaRef(schema.anyOf[0]);
    }

    if (schema.oneOf && schema.oneOf.length > 0) {
      return this.resolveSchemaRef(schema.oneOf[0]);
    }

    // Return the schema as-is
    return schema;
  }

  resolveParameters(params = [], spec) {
    if (!params) return [];

    const result = [];

    for (const param of params) {
      if (param.$ref) {
        const resolved = this.resolveRef(param.$ref, spec);

        // If resolved is an array (parameterGroup), recursively resolve its items
        if (Array.isArray(resolved)) {
          const nestedResolved = this.resolveParameters(resolved, spec);
          result.push(...nestedResolved);
        } else {
          result.push(resolved || param);
        }
      } else {
        result.push(param);
      }
    }

    return result;
  }

  mergeParameters(pathLevelParams = [], operationLevelParams = [], spec) {
    const resolvedPathParams = this.resolveParameters(pathLevelParams, spec);
    const resolvedOpParams = this.resolveParameters(operationLevelParams, spec);

    const merged = [...resolvedPathParams];
    const pathParamKeys = new Set(
      resolvedPathParams.map(p => `${p.name}:${p.in}`.toLowerCase())
    );

    for (const param of resolvedOpParams) {
      const key = `${param.name}:${param.in}`.toLowerCase();
      if (pathParamKeys.has(key)) {
        const index = merged.findIndex(
          p => `${p.name}:${p.in}`.toLowerCase() === key
        );
        if (index !== -1) {
          merged[index] = param;
        }
      } else {
        merged.push(param);
      }
    }

    return merged;
  }
}
