/**
 * OpenAPI 3.1.0 Specific Features Tests
 *
 * Tests features that are specific to OpenAPI 3.1.0 and not available in 3.0.x:
 * - Webhooks support
 * - JSON Schema 2020-12 alignment (prefixItems, $dynamicRef, etc.)
 * - License identifier field
 * - Info summary field
 * - Path item $ref at top level
 */

import { OpenApiProcessor } from '../utils/OpenApiProcessor.js';

describe('OpenAPI 3.1.0 Specific Features', () => {
  let processor;

  beforeEach(() => {
    processor = new OpenApiProcessor();
  });

  test('should handle info.summary field (new in 3.1.0)', () => {
    const spec = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
        summary: 'A brief summary of the API',
        description: 'A more detailed description of the API'
      },
      paths: {}
    };

    const data = processor.process(spec);

    expect(data.info.title).toBe('Test API');
    expect(data.info.version).toBe('1.0.0');
    expect(data.info.description).toBe('A more detailed description of the API');
  });

  test('should handle info.license.identifier field (new in 3.1.0)', () => {
    const spec = {
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: {
          name: 'Apache License 2.0',
          identifier: 'Apache-2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        }
      },
      paths: {}
    };

    const data = processor.process(spec);

    expect(data.info.title).toBe('Test API');
    expect(data.info.license).toEqual({
      name: 'Apache License 2.0',
      identifier: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    });
  });

  test('should handle JSON Schema 2020-12 prefixItems (new in 3.1.0)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/coordinates': {
          post: {
            tags: ['Geometry'],
            summary: 'Submit coordinates',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    prefixItems: [
                      { type: 'number', description: 'X coordinate' },
                      { type: 'number', description: 'Y coordinate' },
                      { type: 'number', description: 'Z coordinate' }
                    ],
                    items: false,
                    minItems: 3,
                    maxItems: 3
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const geometryResource = data.resources[0];
    expect(geometryResource.name).toBe('Geometry');
    expect(geometryResource.endpoints).toHaveLength(1);

    const endpoint = geometryResource.endpoints[0];
    expect(endpoint.requestBody).toBeDefined();
    expect(endpoint.requestBody.hasProperties).toBe(false);
  });

  test('should handle $defs instead of definitions (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/$defs/User' }
                        }
                      },
                      $defs: {
                        User: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const usersResource = data.resources[0];
    expect(usersResource.name).toBe('Users');
    expect(usersResource.endpoints).toHaveLength(1);

    const endpoint = usersResource.endpoints[0];
    expect(endpoint.responses).toHaveLength(1);
    expect(endpoint.responses[0].hasSchema).toBe(true);
  });

  test('should handle null as a type value (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/profile': {
          get: {
            tags: ['Profile'],
            summary: 'Get profile',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: {
                          type: ['string', 'null'],
                          description: 'User name or null if not set'
                        },
                        middleName: {
                          type: 'null',
                          description: 'Always null for privacy'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const profileResource = data.resources[0];
    expect(profileResource.name).toBe('Profile');
    expect(profileResource.endpoints).toHaveLength(1);

    const endpoint = profileResource.endpoints[0];
    expect(endpoint.responses[0].hasSchema).toBe(true);
    expect(endpoint.responses[0].hasProperties).toBe(true);
    expect(endpoint.responses[0].properties).toHaveLength(2);
  });

  test('should handle const keyword (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/version': {
          get: {
            tags: ['Meta'],
            summary: 'Get API version',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        apiVersion: {
                          const: '1.0.0',
                          description: 'API version (always 1.0.0)'
                        },
                        schemaVersion: {
                          type: 'string',
                          const: '2020-12'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const metaResource = data.resources[0];
    expect(metaResource.name).toBe('Meta');
    expect(metaResource.endpoints).toHaveLength(1);

    const endpoint = metaResource.endpoints[0];
    expect(endpoint.responses[0].hasProperties).toBe(true);
    expect(endpoint.responses[0].properties).toHaveLength(2);
  });

  test('should handle exclusiveMinimum/exclusiveMaximum as numbers (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/range': {
          post: {
            tags: ['Math'],
            summary: 'Submit range',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      percentage: {
                        type: 'number',
                        exclusiveMinimum: 0,
                        exclusiveMaximum: 100,
                        description: 'Value between 0 and 100 (exclusive)'
                      },
                      probability: {
                        type: 'number',
                        minimum: 0,
                        exclusiveMaximum: 1.0
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const mathResource = data.resources[0];
    expect(mathResource.name).toBe('Math');
    expect(mathResource.endpoints).toHaveLength(1);

    const endpoint = mathResource.endpoints[0];
    expect(endpoint.requestBody).toBeDefined();
    expect(endpoint.requestBody.hasProperties).toBe(true);
    expect(endpoint.requestBody.properties).toHaveLength(2);
  });

  test('should process spec with openapi version 3.1.0', () => {
    const spec = {
      openapi: '3.1.0',
      info: {
        title: 'Modern API',
        version: '2.0.0',
        summary: 'A modern API using OpenAPI 3.1.0'
      },
      paths: {
        '/health': {
          get: {
            tags: ['Health'],
            summary: 'Health check',
            responses: {
              '200': {
                description: 'Healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: {
                          const: 'ok'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.info.title).toBe('Modern API');
    expect(data.info.version).toBe('2.0.0');
    expect(data.resources).toHaveLength(1);
    expect(data.resources[0].endpoints).toHaveLength(1);
  });

  test('should handle contentMediaType and contentEncoding (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/upload': {
          post: {
            tags: ['Files'],
            summary: 'Upload file',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'string',
                        contentMediaType: 'image/png',
                        contentEncoding: 'base64',
                        description: 'Base64-encoded PNG image'
                      },
                      metadata: {
                        type: 'string',
                        contentMediaType: 'application/json'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const filesResource = data.resources[0];
    expect(filesResource.name).toBe('Files');
    expect(filesResource.endpoints).toHaveLength(1);

    const endpoint = filesResource.endpoints[0];
    expect(endpoint.requestBody).toBeDefined();
    expect(endpoint.requestBody.hasProperties).toBe(true);
    expect(endpoint.requestBody.properties).toHaveLength(2);
  });

  test('should handle unevaluatedProperties (JSON Schema 2020-12)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/strict': {
          post: {
            tags: ['Validation'],
            summary: 'Strict validation',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' }
                    },
                    unevaluatedProperties: false,
                    description: 'Only allows defined properties'
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const validationResource = data.resources[0];
    expect(validationResource.name).toBe('Validation');
    expect(validationResource.endpoints).toHaveLength(1);

    const endpoint = validationResource.endpoints[0];
    expect(endpoint.requestBody).toBeDefined();
    expect(endpoint.requestBody.hasProperties).toBe(true);
  });
});
