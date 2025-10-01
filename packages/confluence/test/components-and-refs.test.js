/**
 * Confluence Generator Components and References Tests
 *
 * Verifies that the Confluence generator properly supports OpenAPI components
 * (schemas, parameters, responses, examples) and $ref references through its
 * inheritance from the markdown generator
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { StandaloneConfluenceGenerator } from '../standalone-generator.js';

describe('Confluence Generator - Components and References', () => {
  let testDir;
  let outputDir;
  let specPath;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `confluence-components-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    outputDir = path.join(testDir, 'output');
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should support schema components with $ref', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Schema Components Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users': {
          get: {
            tags: ['Users'],
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            tags: ['Users'],
            summary: 'Create a user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: {
                type: 'integer',
                description: 'User ID'
              },
              name: {
                type: 'string',
                description: 'User name'
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
              },
              role: {
                type: 'string',
                enum: ['user', 'admin', 'moderator'],
                description: 'User role'
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
    expect(fs.existsSync(result.outputPath)).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get all users');
    expect(markdownContent).toContain('Create a user');
    expect(markdownContent).toContain('# Schemas');
    expect(markdownContent).toContain('## User');
    expect(markdownContent).toContain('| Property | Type | Description |');
    expect(markdownContent).toContain('id');
    expect(markdownContent).toContain('name');
    expect(markdownContent).toContain('email');
    expect(markdownContent).toContain('role');
  });

  test('should support nested schema references', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Nested Schema Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/organizations/{id}': {
          get: {
            tags: ['Organizations'],
            summary: 'Get organization details',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Organization'
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Organization: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              name: {
                type: 'string'
              },
              owner: {
                $ref: '#/components/schemas/User'
              },
              members: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              username: {
                type: 'string'
              },
              email: {
                type: 'string'
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-nested.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get organization details');
    expect(markdownContent).toContain('# Schemas');
    expect(markdownContent).toContain('## Organization');
    expect(markdownContent).toContain('## User');
  });

  test('should support parameter components with $ref', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Parameter Components Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{userId}': {
          get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            parameters: [
              {
                $ref: '#/components/parameters/UserId'
              },
              {
                $ref: '#/components/parameters/IncludeInactive'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        },
        '/api/posts/{userId}': {
          get: {
            tags: ['Posts'],
            summary: 'Get posts by user',
            parameters: [
              {
                $ref: '#/components/parameters/UserId'
              },
              {
                name: 'limit',
                in: 'query',
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
          IncludeInactive: {
            name: 'includeInactive',
            in: 'query',
            required: false,
            description: 'Include inactive users in results',
            schema: {
              type: 'boolean',
              default: false
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-params.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get user by ID');
    expect(markdownContent).toContain('Get posts by user');
    expect(markdownContent).toContain('### Parameters');
    expect(markdownContent).toContain('limit');
    expect(markdownContent).toContain('query');
  });

  test('should support response components with $ref', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Response Components Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users/{id}': {
          get: {
            tags: ['Users'],
            summary: 'Get user',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              },
              '404': {
                $ref: '#/components/responses/NotFound'
              },
              '500': {
                $ref: '#/components/responses/InternalError'
              }
            }
          },
          delete: {
            tags: ['Users'],
            summary: 'Delete user',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              '204': {
                description: 'No Content'
              },
              '404': {
                $ref: '#/components/responses/NotFound'
              },
              '500': {
                $ref: '#/components/responses/InternalError'
              }
            }
          }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' }
            }
          },
          Error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' }
            }
          }
        },
        responses: {
          NotFound: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          InternalError: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-responses.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get user');
    expect(markdownContent).toContain('Delete user');
    expect(markdownContent).toContain('### Responses');
    expect(markdownContent).toContain('404');
    expect(markdownContent).toContain('500');
    expect(markdownContent).toContain('# Schemas');
  });

  test('should support requestBody components with $ref', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'RequestBody Components Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/users': {
          post: {
            tags: ['Users'],
            summary: 'Create user',
            requestBody: {
              $ref: '#/components/requestBodies/UserBody'
            },
            responses: {
              '201': {
                description: 'Created'
              }
            }
          }
        },
        '/api/users/{id}': {
          put: {
            tags: ['Users'],
            summary: 'Update user',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            requestBody: {
              $ref: '#/components/requestBodies/UserBody'
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
        schemas: {
          User: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: {
                type: 'string',
                description: 'User full name'
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email address'
              },
              age: {
                type: 'integer',
                minimum: 18,
                description: 'User age (must be 18+)'
              }
            }
          }
        },
        requestBodies: {
          UserBody: {
            description: 'User information payload',
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-requestbody.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Create user');
    expect(markdownContent).toContain('Update user');
    expect(markdownContent).toContain('# Schemas');
    expect(markdownContent).toContain('## User');
    expect(markdownContent).toContain('Content-Type');
  });

  test('should support security scheme components', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Security Components Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/public': {
          get: {
            tags: ['Public'],
            summary: 'Public endpoint',
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        },
        '/api/protected': {
          get: {
            tags: ['Protected'],
            summary: 'Protected endpoint',
            security: [
              {
                bearerAuth: []
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              },
              '401': {
                description: 'Unauthorized'
              }
            }
          }
        },
        '/api/admin': {
          get: {
            tags: ['Admin'],
            summary: 'Admin endpoint',
            security: [
              {
                bearerAuth: []
              },
              {
                apiKey: []
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT Bearer token authentication'
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for service authentication'
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-security.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Public endpoint');
    expect(markdownContent).toContain('Protected endpoint');
    expect(markdownContent).toContain('Admin endpoint');
  });

  test('should support allOf composition with components', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'AllOf Composition Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/employees': {
          get: {
            tags: ['Employees'],
            summary: 'Get all employees',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Employee'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Person: {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
                description: 'Person name'
              },
              age: {
                type: 'integer',
                description: 'Person age'
              }
            }
          },
          Employee: {
            allOf: [
              {
                $ref: '#/components/schemas/Person'
              },
              {
                type: 'object',
                required: ['employeeId'],
                properties: {
                  employeeId: {
                    type: 'string',
                    description: 'Employee ID'
                  },
                  department: {
                    type: 'string',
                    description: 'Department name'
                  }
                }
              }
            ]
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-allof.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get all employees');
    expect(markdownContent).toContain('# Schemas');
  });

  test('should support Turkish characters in component schemas', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Türkçe Komponent API',
        version: '1.0.0'
      },
      paths: {
        '/api/kullanıcılar': {
          get: {
            tags: ['Kullanıcılar'],
            summary: 'Tüm kullanıcıları getir',
            responses: {
              '200': {
                description: 'Başarılı',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Kullanıcı'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Kullanıcı: {
            type: 'object',
            required: ['isim', 'eposta'],
            properties: {
              isim: {
                type: 'string',
                description: 'Kullanıcı ismi'
              },
              eposta: {
                type: 'string',
                format: 'email',
                description: 'E-posta adresi'
              },
              şehir: {
                type: 'string',
                enum: ['İstanbul', 'Ankara', 'İzmir'],
                description: 'Kullanıcının şehri'
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

    expect(markdownContent).toContain('Kullanıcılar');
    expect(markdownContent).toContain('Tüm kullanıcıları getir');
    expect(markdownContent).toContain('# Schemas');
    expect(markdownContent).toContain('## Kullanıcı');
    expect(markdownContent).toContain('isim');
    expect(markdownContent).toContain('eposta');
    expect(markdownContent).toContain('şehir');
  });

  test('should handle circular references gracefully', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Circular Reference Test API',
        version: '1.0.0'
      },
      paths: {
        '/api/nodes/{id}': {
          get: {
            tags: ['Nodes'],
            summary: 'Get node with children',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                  type: 'integer'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Node'
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Node ID'
              },
              name: {
                type: 'string',
                description: 'Node name'
              },
              children: {
                type: 'array',
                description: 'Child nodes',
                items: {
                  $ref: '#/components/schemas/Node'
                }
              }
            }
          }
        }
      }
    };

    specPath = path.join(testDir, 'spec-circular.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    const generator = new StandaloneConfluenceGenerator(outputDir, {
      specPath,
      excludeBrand: true
    });

    const result = await generator.generate({ copyToClipboard: false });

    expect(result.success).toBe(true);

    const markdownContent = fs.readFileSync(result.outputPath, 'utf8');

    expect(markdownContent).toContain('Get node with children');
    expect(markdownContent).toContain('# Schemas');
    expect(markdownContent).toContain('## Node');
  });
});
