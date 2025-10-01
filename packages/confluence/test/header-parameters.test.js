/**
 * Confluence Generator Header Parameters Tests
 *
 * Verifies that the Confluence generator properly supports header type parameters
 * through its inheritance from the markdown generator
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneConfluenceGenerator } from '../standalone-generator.js';

describe('Confluence Generator - Header Parameters', () => {
  let testDir;
  let outputDir;
  let specPath;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `confluence-header-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    outputDir = path.join(testDir, 'output');
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should generate markdown with header parameters', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Header Parameters Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get all users',
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                description: 'Bearer token for authentication',
                schema: {
                  type: 'string'
                },
                example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              {
                name: 'X-API-Key',
                in: 'header',
                required: true,
                description: 'API key for rate limiting',
                schema: {
                  type: 'string'
                },
                example: 'abc123def456'
              },
              {
                name: 'X-Request-ID',
                in: 'header',
                required: false,
                description: 'Optional request tracking ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                },
                example: '550e8400-e29b-41d4-a716-446655440000'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBeDefined();
    expect(fs.existsSync(result.outputPath)).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('curl');
    expect(markdownContent).toContain('-H \'Authorization: value\'');
    expect(markdownContent).toContain('-H \'X-API-Key: value\'');
    expect(markdownContent).toContain('-H \'X-Request-ID: value\'');
  });

  test('should handle header parameters with multiple examples', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Header Examples Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/data': {
          get: {
            tags: ['Data'],
            summary: 'Get data with various auth methods',
            parameters: [
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                description: 'Authentication token',
                schema: {
                  type: 'string'
                },
                examples: {
                  bearer_token: {
                    summary: 'Bearer Token',
                    description: 'Standard OAuth 2.0 bearer token',
                    value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  api_key: {
                    summary: 'API Key',
                    description: 'Legacy API key authentication',
                    value: 'ApiKey abc123def456'
                  },
                  basic_auth: {
                    summary: 'Basic Authentication',
                    description: 'Basic auth with base64 encoded credentials',
                    value: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='
                  }
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-with-examples.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('curl');
    expect(markdownContent).toContain('-H \'Authorization: value\'');
  });

  test('should display header parameters alongside query and path parameters', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Mixed Parameters Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{userId}': {
          get: {
            tags: ['Users'],
            summary: 'Get user by ID with filtering',
            parameters: [
              {
                name: 'userId',
                in: 'path',
                required: true,
                description: 'User identifier',
                schema: {
                  type: 'integer'
                },
                example: 12345
              },
              {
                name: 'fields',
                in: 'query',
                required: false,
                description: 'Comma-separated list of fields to return',
                schema: {
                  type: 'string'
                },
                example: 'name,email,role'
              },
              {
                name: 'Authorization',
                in: 'header',
                required: true,
                description: 'Bearer authentication token',
                schema: {
                  type: 'string'
                },
                example: 'Bearer token123'
              },
              {
                name: 'Accept-Language',
                in: 'header',
                required: false,
                description: 'Preferred language for response',
                schema: {
                  type: 'string',
                  enum: ['en', 'es', 'fr', 'de', 'tr']
                },
                example: 'en'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-mixed-params.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Parameters');
    expect(markdownContent).toContain('userId');
    expect(markdownContent).toContain('path');
    expect(markdownContent).toContain('fields');
    expect(markdownContent).toContain('query');
    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('-H \'Authorization: value\'');
    expect(markdownContent).toContain('-H \'Accept-Language: value\'');
  });

  test('should handle header parameters with enum values', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Header Enum Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/content': {
          get: {
            tags: ['Content'],
            summary: 'Get content with format specification',
            parameters: [
              {
                name: 'Accept',
                in: 'header',
                required: true,
                description: 'Content type to accept',
                schema: {
                  type: 'string',
                  enum: ['application/json', 'application/xml', 'text/html']
                },
                example: 'application/json'
              },
              {
                name: 'X-API-Version',
                in: 'header',
                required: false,
                description: 'API version to use',
                schema: {
                  type: 'string',
                  enum: ['v1', 'v2', 'v3']
                },
                example: 'v2'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-header-enum.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('curl');
    expect(markdownContent).toContain('-H \'Accept: value\'');
    expect(markdownContent).toContain('-H \'X-API-Version: value\'');
  });

  test('should handle Turkish characters in header parameter descriptions', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Turkish Header Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/türkçe': {
          get: {
            tags: ['Türkçe'],
            summary: 'Türkçe karakterli endpoint',
            parameters: [
              {
                name: 'X-Dil-Seçimi',
                in: 'header',
                required: false,
                description: 'Kullanıcının tercih ettiği dil seçimi',
                schema: {
                  type: 'string',
                  enum: ['Türkçe', 'İngilizce', 'Almanca']
                },
                example: 'Türkçe'
              },
              {
                name: 'X-Şehir',
                in: 'header',
                required: false,
                description: 'İstanbul, İzmir, Ankara gibi şehirler',
                schema: {
                  type: 'string'
                },
                example: 'İstanbul'
              }
            ],
            responses: {
              '200': {
                description: 'Başarılı'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-turkish.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('curl');
    expect(markdownContent).toContain('X-Dil-Seçimi');
    expect(markdownContent).toContain('X-Şehir');
  });

  test('should handle complex header parameters with object schemas', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Complex Header Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/search': {
          get: {
            tags: ['Search'],
            summary: 'Search with complex filters',
            parameters: [
              {
                name: 'X-Filter-Config',
                in: 'header',
                required: false,
                description: 'Complex filter configuration',
                schema: {
                  type: 'string'
                },
                examples: {
                  simple_filter: {
                    summary: 'Simple status filter',
                    description: 'Filter only by status',
                    value: '{"status":"active"}'
                  },
                  complex_filter: {
                    summary: 'Multi-field filter',
                    description: 'Filter by multiple fields with operators',
                    value: '{"status":"active","role":["admin","moderator"],"created":{"gt":"2024-01-01"}}'
                  }
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-complex-header.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Code Sample');
    expect(markdownContent).toContain('curl');
    expect(markdownContent).toContain('-H \'X-Filter-Config: value\'');
  });

  test('should respect urlEncodeAnchors option with header parameters', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Anchor Encoding Test',
        version: '1.0.0'
      },
      paths: {
        '/api/test': {
          get: {
            tags: ['Test'],
            summary: 'Test endpoint with headers',
            parameters: [
              {
                name: 'X-Custom-Header',
                in: 'header',
                required: true,
                description: 'Custom header for testing',
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-anchor-test.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generatorWithEncoding = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true,
      urlEncodeAnchors: true
    });

    const resultWithEncoding = await generatorWithEncoding.generate({ copyToClipboard: false });
    expect(resultWithEncoding.success).toBe(true);

    const generatorNoEncoding = new StandaloneConfluenceGenerator(path.join(outputDir, 'no-encoding'), {
      specPath,
      excludeBrand: true,
      urlEncodeAnchors: false
    });

    const resultNoEncoding = await generatorNoEncoding.generate({ copyToClipboard: false });
    expect(resultNoEncoding.success).toBe(true);

    const contentWithEncoding = fs.readFileSync(resultWithEncoding.outputPath, 'utf8');
    const contentNoEncoding = fs.readFileSync(resultNoEncoding.outputPath, 'utf8');

    expect(contentWithEncoding).toContain('X-Custom-Header');
    expect(contentNoEncoding).toContain('X-Custom-Header');
  });
});
