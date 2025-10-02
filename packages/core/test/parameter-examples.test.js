/**
 * Parameter Examples Tests
 *
 * Tests for parameter examples extraction and rendering,
 * including multiple examples and component references.
 */

import { OpenApiProcessor } from '../utils/OpenApiProcessor.js';

describe('Parameter Examples', () => {
  let processor;

  beforeEach(() => {
    processor = new OpenApiProcessor();
  });

  test('should extract multiple examples from parameter', () => {
    const param = {
      name: 'userId',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid'
      },
      examples: {
        admin: {
          summary: 'Admin user',
          description: 'Example UUID for admin user',
          value: '550e8400-e29b-41d4-a716-446655440000'
        },
        regular: {
          summary: 'Regular user',
          description: 'Example UUID for regular user',
          value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
        },
        guest: {
          summary: 'Guest user',
          value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
        }
      }
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(3);
    expect(examples[0]).toEqual({
      name: 'admin',
      summary: 'Admin user',
      description: 'Example UUID for admin user',
      value: '550e8400-e29b-41d4-a716-446655440000'
    });
    expect(examples[1]).toEqual({
      name: 'regular',
      summary: 'Regular user',
      description: 'Example UUID for regular user',
      value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    });
    expect(examples[2]).toEqual({
      name: 'guest',
      summary: 'Guest user',
      description: '',
      value: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
    });
  });

  test('should extract single example from parameter', () => {
    const param = {
      name: 'productId',
      in: 'query',
      schema: {
        type: 'integer'
      },
      example: 12345
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(1);
    expect(examples[0]).toEqual({
      name: 'example',
      summary: 'Example',
      description: 'Parameter example',
      value: 12345
    });
  });

  test('should extract example from schema when no parameter example exists', () => {
    const param = {
      name: 'status',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['active', 'inactive'],
        example: 'active'
      }
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(1);
    expect(examples[0]).toEqual({
      name: 'schema_example',
      summary: 'Schema Example',
      description: 'Example from parameter schema',
      value: 'active'
    });
  });

  test('should handle complex object examples', () => {
    const param = {
      name: 'filter',
      in: 'query',
      schema: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' }
        }
      },
      examples: {
        lastWeek: {
          summary: 'Last week filter',
          value: {
            startDate: '2024-01-01',
            endDate: '2024-01-07'
          }
        },
        lastMonth: {
          summary: 'Last month filter',
          value: {
            startDate: '2024-01-01',
            endDate: '2024-01-31'
          }
        }
      }
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(2);
    expect(JSON.parse(examples[0].value)).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-07'
    });
    expect(JSON.parse(examples[1].value)).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
  });

  test('should process endpoint with parameter component reference', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users/{userId}': {
          get: {
            tags: ['Users'],
            summary: 'Get user by ID',
            parameters: [
              { $ref: '#/components/parameters/UserIdParam' }
            ],
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '/users/{userId}/posts': {
          get: {
            tags: ['Users'],
            summary: 'Get user posts',
            parameters: [
              { $ref: '#/components/parameters/UserIdParam' },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer' },
                example: 10
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        parameters: {
          UserIdParam: {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            },
            examples: {
              admin: {
                summary: 'Admin user ID',
                description: 'UUID for administrator account',
                value: '550e8400-e29b-41d4-a716-446655440000'
              },
              regular: {
                summary: 'Regular user ID',
                description: 'UUID for regular user account',
                value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    // Check that resources exist
    expect(data.resources).toHaveLength(1);
    const usersResource = data.resources[0];
    expect(usersResource.name).toBe('Users');
    expect(usersResource.endpoints).toHaveLength(2);

    // Check first endpoint (GET /users/{userId})
    const firstEndpoint = usersResource.endpoints[0];
    expect(firstEndpoint.parameters).toHaveLength(1);
    expect(firstEndpoint.parameters[0].name).toBe('userId');
    expect(firstEndpoint.parameters[0].description).toBe('User identifier');
    expect(firstEndpoint.parameters[0].hasExamples).toBe(true);
    expect(firstEndpoint.parameters[0].examples).toHaveLength(2);
    expect(firstEndpoint.parameters[0].examples[0].name).toBe('admin');
    expect(firstEndpoint.parameters[0].examples[0].summary).toBe('Admin user ID');
    expect(firstEndpoint.parameters[0].examples[1].name).toBe('regular');

    // Check second endpoint (GET /users/{userId}/posts)
    const secondEndpoint = usersResource.endpoints[1];
    expect(secondEndpoint.parameters).toHaveLength(2);
    // First parameter should be the resolved UserIdParam reference
    expect(secondEndpoint.parameters[0].name).toBe('userId');
    expect(secondEndpoint.parameters[0].examples).toHaveLength(2);
    // Second parameter is the inline limit parameter
    expect(secondEndpoint.parameters[1].name).toBe('limit');
    expect(secondEndpoint.parameters[1].hasExamples).toBe(true);
    expect(secondEndpoint.parameters[1].examples).toHaveLength(1);
  });

  test('should handle parameter groups with component references', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/branches/{branchId}': {
          get: {
            tags: ['Branches'],
            summary: 'Get branch details',
            parameters: [
              { $ref: '#/components/parameterGroups/CommonHeaders' }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        parameterGroups: {
          CommonHeaders: [
            { $ref: '#/components/parameters/OtpHeader' },
            { $ref: '#/components/parameters/OtpIdHeader' }
          ]
        },
        parameters: {
          OtpHeader: {
            name: 'otp',
            in: 'header',
            schema: { type: 'string', pattern: '^[0-9]{6}$' },
            description: '6-digit OTP code',
            examples: {
              valid: {
                summary: 'Valid OTP',
                value: '123456'
              },
              expired: {
                summary: 'Expired OTP (for testing)',
                value: '999999'
              }
            }
          },
          OtpIdHeader: {
            name: 'otp-id',
            in: 'header',
            schema: { type: 'string' },
            description: 'OTP identifier from SMS',
            example: '550e8400-e29b-41d4-a716-446655440000'
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const branchesResource = data.resources[0];
    expect(branchesResource.name).toBe('Branches');
    expect(branchesResource.endpoints).toHaveLength(1);

    const endpoint = branchesResource.endpoints[0];

    // Should have 2 parameters from the parameter group
    expect(endpoint.parameters).toHaveLength(2);

    // First parameter (otp) should have multiple examples
    expect(endpoint.parameters[0].name).toBe('otp');
    expect(endpoint.parameters[0].hasExamples).toBe(true);
    expect(endpoint.parameters[0].examples).toHaveLength(2);
    expect(endpoint.parameters[0].examples[0].name).toBe('valid');
    expect(endpoint.parameters[0].examples[1].name).toBe('expired');

    // Second parameter (otp-id) should have single example
    expect(endpoint.parameters[1].name).toBe('otp-id');
    expect(endpoint.parameters[1].hasExamples).toBe(true);
    expect(endpoint.parameters[1].examples).toHaveLength(1);
  });

  test('should return empty array when no examples exist', () => {
    const param = {
      name: 'query',
      in: 'query',
      schema: {
        type: 'string'
      }
    };

    const examples = processor.extractParameterExamples(param);
    expect(examples).toHaveLength(0);
  });

  test('should handle $ref examples correctly', () => {
    const param = {
      name: 'userId',
      in: 'path',
      schema: { type: 'string' },
      examples: {
        user1: {
          $ref: '#/components/examples/ExternalExample'
        },
        user2: {
          summary: 'Direct example',
          value: 'direct-value'
        }
      }
    };

    const examples = processor.extractParameterExamples(param);

    // $ref examples should be skipped (external references)
    expect(examples).toHaveLength(1);
    expect(examples[0].name).toBe('user2');
    expect(examples[0].value).toBe('direct-value');
  });

  test('should handle array values in examples', () => {
    const param = {
      name: 'tags',
      in: 'query',
      schema: {
        type: 'array',
        items: { type: 'string' }
      },
      examples: {
        tech: {
          summary: 'Technology tags',
          value: ['javascript', 'nodejs', 'api']
        },
        empty: {
          summary: 'No tags',
          value: []
        }
      }
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(2);
    expect(JSON.parse(examples[0].value)).toEqual(['javascript', 'nodejs', 'api']);
    expect(JSON.parse(examples[1].value)).toEqual([]);
  });

  test('should preserve Turkish characters in example values', () => {
    const param = {
      name: 'cityName',
      in: 'query',
      schema: { type: 'string' },
      examples: {
        istanbul: {
          summary: 'İstanbul örneği',
          description: 'Türkiye\'nin en büyük şehri',
          value: 'İstanbul'
        },
        ankara: {
          summary: 'Ankara örneği',
          value: 'Ankara'
        }
      }
    };

    const examples = processor.extractParameterExamples(param);

    expect(examples).toHaveLength(2);
    expect(examples[0].summary).toBe('İstanbul örneği');
    expect(examples[0].description).toBe('Türkiye\'nin en büyük şehri');
    expect(examples[0].value).toBe('İstanbul');
    expect(examples[1].value).toBe('Ankara');
  });
});
