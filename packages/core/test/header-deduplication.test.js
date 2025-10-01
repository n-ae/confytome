/**
 * Header Deduplication Tests
 *
 * Verifies that header parameters are not duplicated when:
 * 1. Explicit header parameters are defined in OpenAPI spec
 * 2. Security schemes are also defined (which might add Authorization header)
 * 3. Both explicit parameters and security schemes exist together
 */

import { OpenApiProcessor } from '../utils/OpenApiProcessor.js';

describe('Header Deduplication', () => {
  let processor;

  beforeEach(() => {
    processor = new OpenApiProcessor({});
  });

  test('should not duplicate Authorization header when explicit parameter exists', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                description: 'Bearer token',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    const authHeaders = headers.filter(h => h.name.toLowerCase() === 'authorization');
    expect(authHeaders).toHaveLength(1);
    expect(headers).toHaveLength(1);
  });

  test('should not duplicate custom header when explicitly defined', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'X-API-Key',
                in: 'header',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    const apiKeyHeaders = headers.filter(h => h.name.toLowerCase() === 'x-api-key');
    expect(apiKeyHeaders).toHaveLength(1);
    expect(headers).toHaveLength(1);
  });

  test('should handle multiple explicit headers without duplication', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                schema: { type: 'string' }
              },
              {
                name: 'X-Custom-Header',
                in: 'header',
                required: false,
                schema: { type: 'string' }
              },
              {
                name: 'Accept-Language',
                in: 'header',
                required: false,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    expect(headers).toHaveLength(3);

    const headerNames = headers.map(h => h.name.toLowerCase());
    expect(new Set(headerNames).size).toBe(3);

    expect(headerNames).toContain('authorization');
    expect(headerNames).toContain('x-custom-header');
    expect(headerNames).toContain('accept-language');
  });

  test('should add Authorization header when no explicit header exists', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer' }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    expect(headers).toHaveLength(1);
    expect(headers[0].name).toBe('Authorization');
    expect(headers[0].example).toContain('Bearer');
  });

  test('should be case-insensitive when checking for duplicates', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'authorization',
                in: 'header',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    expect(headers).toHaveLength(1);
    expect(headers[0].name.toLowerCase()).toBe('authorization');
  });

  test('should handle no headers without errors', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      }
    };

    const operation = spec.paths['/api/users'].get;
    const headers = processor.processHeaders(operation.parameters || [], operation, spec);

    expect(headers).toHaveLength(0);
  });

  test('should verify generated markdown has no duplicate headers', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get users',
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                schema: { type: 'string' },
                example: 'Bearer token123'
              },
              {
                name: 'X-Custom',
                in: 'header',
                required: false,
                schema: { type: 'string' },
                example: 'custom-value'
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    };

    const data = processor.process(spec);

    const endpoint = data.resources[0].endpoints[0];

    expect(endpoint.headers).toBeDefined();
    expect(endpoint.headers).toHaveLength(2);

    const headerNames = endpoint.headers.map(h => h.name);
    expect(headerNames).toEqual(['Authorization', 'X-Custom']);

    const authHeaders = endpoint.headers.filter(h =>
      h.name.toLowerCase() === 'authorization'
    );
    expect(authHeaders).toHaveLength(1);
  });
});
