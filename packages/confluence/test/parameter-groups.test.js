/**
 * Confluence Generator Parameter Groups Tests
 *
 * Verifies that the Confluence generator properly supports OpenAPI parameter groups:
 * - Path-level parameters shared across operations
 * - Operation-level parameters
 * - Parameter references ($ref)
 * - Combined path + operation parameters
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneConfluenceGenerator } from '../standalone-generator.js';

describe('Confluence Generator - Parameter Groups', () => {
  let testDir;
  let outputDir;
  let specPath;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `confluence-param-groups-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    outputDir = path.join(testDir, 'output');
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should support path-level parameters shared across operations', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Path-Level Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{userId}': {
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
              name: 'X-API-Version',
              in: 'header',
              required: false,
              description: 'API version',
              schema: {
                type: 'string',
                enum: ['v1', 'v2']
              },
              example: 'v2'
            }
          ],
          get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            responses: {
              '200': {
                description: 'Success'
              }
            }
          },
          put: {
            tags: ['Users'],
            summary: 'Update user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Updated'
              }
            }
          },
          delete: {
            tags: ['Users'],
            summary: 'Delete user',
            responses: {
              '204': {
                description: 'No Content'
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

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get user by ID');
    expect(markdownContent).toContain('Update user');
    expect(markdownContent).toContain('Delete user');

    expect(markdownContent).toContain('userId');
    expect(markdownContent).toContain('path');
    expect(markdownContent).toContain('User identifier');

    const getUserSection = markdownContent.split('## Get user by ID')[1].split('*[↑]')[0];
    expect(getUserSection).toContain('userId');
    expect(getUserSection).toContain('X-API-Version');

    const updateSection = markdownContent.split('## Update user')[1].split('*[↑]')[0];
    expect(updateSection).toContain('userId');
    expect(updateSection).toContain('X-API-Version');

    const deleteSection = markdownContent.split('## Delete user')[1].split('*[↑]')[0];
    expect(deleteSection).toContain('userId');
    expect(deleteSection).toContain('X-API-Version');
  });

  test('should merge path-level and operation-level parameters', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Merged Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/posts/{postId}': {
          parameters: [
            {
              name: 'postId',
              in: 'path',
              required: true,
              description: 'Post ID',
              schema: {
                type: 'string'
              }
            }
          ],
          get: {
            tags: ['Posts'],
            summary: 'Get post with comments',
            parameters: [
              {
                name: 'includeComments',
                in: 'query',
                required: false,
                description: 'Include comments in response',
                schema: {
                  type: 'boolean',
                  default: true
                }
              },
              {
                name: 'limit',
                in: 'query',
                required: false,
                description: 'Maximum comments to return',
                schema: {
                  type: 'integer',
                  default: 10
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

    specPath = path.join(testDir, 'spec-merged.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('### Parameters');

    expect(markdownContent).toContain('postId');
    expect(markdownContent).toContain('path');

    expect(markdownContent).toContain('includeComments');
    expect(markdownContent).toContain('limit');
    expect(markdownContent).toContain('query');

    const match = markdownContent.match(/\| (\w+) \| (path|query) \|/g);
    expect(match).toBeTruthy();
    expect(match.length).toBeGreaterThanOrEqual(3);
  });

  test('should support parameter references at path level', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Path-Level Ref Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{userId}': {
          parameters: [
            {
              $ref: '#/components/parameters/UserId'
            },
            {
              $ref: '#/components/parameters/ApiVersion'
            }
          ],
          get: {
            tags: ['Users'],
            summary: 'Get user',
            responses: {
              '200': {
                description: 'Success'
              }
            }
          },
          put: {
            tags: ['Users'],
            summary: 'Update user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Updated'
              }
            }
          }
        }
      },
      components: {
        parameters: {
          UserId: {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'Unique user identifier',
            schema: {
              type: 'integer'
            },
            example: 12345
          },
          ApiVersion: {
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
        }
      }
    };

    specPath = path.join(testDir, 'spec-path-ref.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get user');
    expect(markdownContent).toContain('Update user');

    expect(markdownContent).toContain('userId');
    expect(markdownContent).toContain('X-API-Version');

    const getUserSection = markdownContent.split('## Get user')[1].split('##')[0];
    expect(getUserSection).toContain('userId');

    const updateSection = markdownContent.split('## Update user')[1].split('##')[0];
    expect(updateSection).toContain('userId');
  });

  test('should merge path-level refs with operation-level parameters', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Mixed Ref Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/projects/{projectId}/tasks': {
          parameters: [
            {
              $ref: '#/components/parameters/ProjectId'
            }
          ],
          get: {
            tags: ['Tasks'],
            summary: 'List project tasks',
            parameters: [
              {
                name: 'status',
                in: 'query',
                required: false,
                description: 'Filter by status',
                schema: {
                  type: 'string',
                  enum: ['open', 'in-progress', 'completed']
                }
              },
              {
                $ref: '#/components/parameters/Pagination'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          },
          post: {
            tags: ['Tasks'],
            summary: 'Create task',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Created'
              }
            }
          }
        }
      },
      components: {
        parameters: {
          ProjectId: {
            name: 'projectId',
            in: 'path',
            required: true,
            description: 'Project identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          Pagination: {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Number of items to return',
            schema: {
              type: 'integer',
              default: 20,
              maximum: 100
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-mixed-ref.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('List project tasks');
    expect(markdownContent).toContain('Create task');

    const listSection = markdownContent.split('## List project tasks')[1].split('*[↑]')[0];

    expect(listSection).toContain('projectId');
    expect(listSection).toContain('path');

    expect(listSection).toContain('status');
    expect(listSection).toContain('limit');
    expect(listSection).toContain('query');

    const createSection = markdownContent.split('## Create task')[1].split('*[↑]')[0];
    expect(createSection).toContain('projectId');
  });

  test('should handle parameter overrides at operation level', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Parameter Override API',
        version: '1.0.0'
      },
      paths: {
        '/api/items/{itemId}': {
          parameters: [
            {
              name: 'itemId',
              in: 'path',
              required: true,
              description: 'Item ID from path level',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'format',
              in: 'query',
              required: false,
              description: 'Response format from path level',
              schema: {
                type: 'string',
                enum: ['json', 'xml']
              }
            }
          ],
          get: {
            tags: ['Items'],
            summary: 'Get item',
            parameters: [
              {
                name: 'format',
                in: 'query',
                required: false,
                description: 'Response format (overridden at operation level)',
                schema: {
                  type: 'string',
                  enum: ['json', 'xml', 'csv']
                }
              },
              {
                name: 'includeMetadata',
                in: 'query',
                required: false,
                description: 'Include metadata',
                schema: {
                  type: 'boolean'
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

    specPath = path.join(testDir, 'spec-override.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('itemId');
    expect(markdownContent).toContain('format');
    expect(markdownContent).toContain('includeMetadata');

    const formatMatches = (markdownContent.match(/\| format \|/g) || []).length;
    expect(formatMatches).toBe(1);
  });

  test('should support Turkish characters in parameter groups', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Türkçe Parametre Grupları API',
        version: '1.0.0'
      },
      paths: {
        '/api/şehirler/{şehirId}': {
          parameters: [
            {
              name: 'şehirId',
              in: 'path',
              required: true,
              description: 'Şehir kimliği',
              schema: {
                type: 'integer'
              }
            },
            {
              name: 'dil',
              in: 'query',
              required: false,
              description: 'Dil seçimi',
              schema: {
                type: 'string',
                enum: ['Türkçe', 'İngilizce']
              }
            }
          ],
          get: {
            tags: ['Şehirler'],
            summary: 'Şehir bilgisini getir',
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

    expect(markdownContent).toContain('şehirId');
    expect(markdownContent).toContain('Şehir kimliği');
    expect(markdownContent).toContain('dil');
    expect(markdownContent).toContain('Dil seçimi');
    expect(markdownContent).toContain('Türkçe');
    expect(markdownContent).toContain('İngilizce');
  });

  test('should handle empty path-level parameters array', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Empty Path Parameters API',
        version: '1.0.0'
      },
      paths: {
        '/api/health': {
          parameters: [],
          get: {
            tags: ['System'],
            summary: 'Health check',
            responses: {
              '200': {
                description: 'Healthy'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-empty.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Health check');
  });

  test('should verify parameter groups work with multiple paths', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Multiple Paths API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{userId}': {
          parameters: [
            {
              $ref: '#/components/parameters/UserId'
            }
          ],
          get: {
            tags: ['Users'],
            summary: 'Get user',
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/api/users/{userId}/posts': {
          parameters: [
            {
              $ref: '#/components/parameters/UserId'
            }
          ],
          get: {
            tags: ['Posts'],
            summary: 'Get user posts',
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/api/users/{userId}/comments': {
          parameters: [
            {
              $ref: '#/components/parameters/UserId'
            }
          ],
          get: {
            tags: ['Comments'],
            summary: 'Get user comments',
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        parameters: {
          UserId: {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'integer'
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-multiple.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get user');
    expect(markdownContent).toContain('Get user posts');
    expect(markdownContent).toContain('Get user comments');

    const userIdMatches = (markdownContent.match(/\| userId \|/g) || []).length;
    expect(userIdMatches).toBeGreaterThanOrEqual(3);
  });
});
