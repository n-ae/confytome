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

  test('should override component parameter with inline parameter and different examples', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/branches/{branchId}': {
          get: {
            tags: ['Branches'],
            summary: 'Get branch details',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID (long integer)',
                examples: {
                  valid: {
                    summary: 'Valid branch ID',
                    description: 'A valid branch identifier',
                    value: 123456789012345
                  },
                  invalid: {
                    summary: 'Invalid branch ID',
                    description: 'An invalid branch for testing',
                    value: 999999999999999
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          },
          post: {
            tags: ['Branches'],
            summary: 'Update branch',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for update (must be owned)',
                examples: {
                  owned: {
                    summary: 'Owned branch',
                    description: 'Branch owned by requesting user',
                    value: 111111111111111
                  },
                  test: {
                    summary: 'Test branch',
                    value: 222222222222222
                  }
                }
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
          BranchIdParam: {
            name: 'branchId',
            in: 'path',
            required: true,
            description: 'Şube kimlik numarası (uzun tam sayı formatında)',
            schema: {
              type: 'integer',
              format: 'int64',
              minimum: 1,
              maximum: 9223372036854776000,
              example: 123456789012345
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const branchesResource = data.resources[0];
    expect(branchesResource.name).toBe('Branches');
    expect(branchesResource.endpoints).toHaveLength(2);

    // GET endpoint uses inline parameter with its own examples
    const getEndpoint = branchesResource.endpoints.find(e => e.method === 'GET');
    expect(getEndpoint.parameters).toHaveLength(1);
    expect(getEndpoint.parameters[0].name).toBe('branchId');
    expect(getEndpoint.parameters[0].description).toBe('Branch ID (long integer)');
    expect(getEndpoint.parameters[0].examples).toHaveLength(2);
    expect(getEndpoint.parameters[0].examples[0].name).toBe('valid');
    expect(getEndpoint.parameters[0].examples[0].summary).toBe('Valid branch ID');
    expect(getEndpoint.parameters[0].examples[0].value).toBe(123456789012345);
    expect(getEndpoint.parameters[0].examples[1].name).toBe('invalid');
    expect(getEndpoint.parameters[0].examples[1].value).toBe(999999999999999);

    // POST endpoint uses inline parameter with different examples
    const postEndpoint = branchesResource.endpoints.find(e => e.method === 'POST');
    expect(postEndpoint.parameters).toHaveLength(1);
    expect(postEndpoint.parameters[0].name).toBe('branchId');
    expect(postEndpoint.parameters[0].description).toBe('Branch ID for update (must be owned)');
    expect(postEndpoint.parameters[0].examples).toHaveLength(2);
    expect(postEndpoint.parameters[0].examples[0].name).toBe('owned');
    expect(postEndpoint.parameters[0].examples[0].summary).toBe('Owned branch');
    expect(postEndpoint.parameters[0].examples[0].value).toBe(111111111111111);
    expect(postEndpoint.parameters[0].examples[1].name).toBe('test');
    expect(postEndpoint.parameters[0].examples[1].value).toBe(222222222222222);
  });

  test('should use BranchIdParam from components with overrides in most paths', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/branches/{branchId}': {
          get: {
            tags: ['Branches'],
            summary: 'Get branch details',
            parameters: [
              { $ref: '#/components/parameters/BranchIdParam' }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/fuelpass-limit': {
          get: {
            tags: ['Branches'],
            summary: 'Get fuelpass limit',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for fuelpass limit check',
                examples: {
                  active: {
                    summary: 'Active branch with fuelpass',
                    value: 111111111111111
                  },
                  inactive: {
                    summary: 'Inactive branch',
                    value: 222222222222222
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/marketing-actions/sticker': {
          post: {
            tags: ['Branches'],
            summary: 'Create marketing sticker',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for marketing action',
                examples: {
                  eligible: {
                    summary: 'Eligible for marketing',
                    value: 333333333333333
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/passcard-affiliate-invoice-info': {
          get: {
            tags: ['Branches'],
            summary: 'Get passcard affiliate invoice info',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for invoice info',
                examples: {
                  withInvoice: {
                    summary: 'Branch with invoices',
                    value: 444444444444444
                  },
                  noInvoice: {
                    summary: 'Branch without invoices',
                    value: 555555555555555
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/last-transfer-debt': {
          get: {
            tags: ['Branches'],
            summary: 'Get last transfer debt',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for debt check',
                examples: {
                  withDebt: {
                    summary: 'Branch with debt',
                    value: 666666666666666
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/orders': {
          get: {
            tags: ['Branches'],
            summary: 'Get branch orders',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for orders',
                examples: {
                  recentOrders: {
                    summary: 'Branch with recent orders',
                    value: 777777777777777
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/actions/extre': {
          post: {
            tags: ['Branches'],
            summary: 'Generate branch statement',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for statement generation',
                examples: {
                  standard: {
                    summary: 'Standard branch statement',
                    value: 888888888888888
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        },
        '/branches/{branchId}/invoices/debts/overdue': {
          get: {
            tags: ['Branches'],
            summary: 'Get overdue debts',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID for overdue debt check',
                examples: {
                  overdue: {
                    summary: 'Branch with overdue debts',
                    value: 999999999999999
                  }
                }
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
          BranchIdParam: {
            name: 'branchId',
            in: 'path',
            required: true,
            description: 'Şube kimlik numarası (uzun tam sayı formatında)',
            schema: {
              type: 'integer',
              format: 'int64',
              minimum: 1,
              maximum: 9223372036854776000
            },
            examples: {
              default: {
                summary: 'Default branch ID',
                description: 'Standard branch identifier',
                value: 123456789012345
              },
              test: {
                summary: 'Test branch ID',
                value: 987654321098765
              }
            }
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const branchesResource = data.resources[0];
    expect(branchesResource.name).toBe('Branches');
    expect(branchesResource.endpoints).toHaveLength(8);

    // First endpoint uses BranchIdParam from components (no override)
    const getDetailsEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get branch details');
    expect(getDetailsEndpoint.parameters).toHaveLength(1);
    expect(getDetailsEndpoint.parameters[0].name).toBe('branchId');
    expect(getDetailsEndpoint.parameters[0].description).toBe('Şube kimlik numarası (uzun tam sayı formatında)');
    expect(getDetailsEndpoint.parameters[0].examples).toHaveLength(2);
    expect(getDetailsEndpoint.parameters[0].examples[0].name).toBe('default');
    expect(getDetailsEndpoint.parameters[0].examples[0].value).toBe(123456789012345);
    expect(getDetailsEndpoint.parameters[0].examples[1].name).toBe('test');
    expect(getDetailsEndpoint.parameters[0].examples[1].value).toBe(987654321098765);

    // Second endpoint overrides with fuelpass-specific examples
    const fuelpassEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get fuelpass limit');
    expect(fuelpassEndpoint.parameters).toHaveLength(1);
    expect(fuelpassEndpoint.parameters[0].description).toBe('Branch ID for fuelpass limit check');
    expect(fuelpassEndpoint.parameters[0].examples).toHaveLength(2);
    expect(fuelpassEndpoint.parameters[0].examples[0].name).toBe('active');
    expect(fuelpassEndpoint.parameters[0].examples[0].value).toBe(111111111111111);
    expect(fuelpassEndpoint.parameters[0].examples[1].name).toBe('inactive');
    expect(fuelpassEndpoint.parameters[0].examples[1].value).toBe(222222222222222);

    // Third endpoint overrides with marketing-specific example
    const marketingEndpoint = branchesResource.endpoints.find(e => e.summary === 'Create marketing sticker');
    expect(marketingEndpoint.parameters).toHaveLength(1);
    expect(marketingEndpoint.parameters[0].description).toBe('Branch ID for marketing action');
    expect(marketingEndpoint.parameters[0].examples).toHaveLength(1);
    expect(marketingEndpoint.parameters[0].examples[0].name).toBe('eligible');
    expect(marketingEndpoint.parameters[0].examples[0].value).toBe(333333333333333);

    // Fourth endpoint overrides with invoice-specific examples
    const invoiceInfoEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get passcard affiliate invoice info');
    expect(invoiceInfoEndpoint.parameters).toHaveLength(1);
    expect(invoiceInfoEndpoint.parameters[0].description).toBe('Branch ID for invoice info');
    expect(invoiceInfoEndpoint.parameters[0].examples).toHaveLength(2);
    expect(invoiceInfoEndpoint.parameters[0].examples[0].name).toBe('withInvoice');
    expect(invoiceInfoEndpoint.parameters[0].examples[0].value).toBe(444444444444444);
    expect(invoiceInfoEndpoint.parameters[0].examples[1].name).toBe('noInvoice');
    expect(invoiceInfoEndpoint.parameters[0].examples[1].value).toBe(555555555555555);

    // Fifth endpoint overrides with debt-specific example
    const debtEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get last transfer debt');
    expect(debtEndpoint.parameters).toHaveLength(1);
    expect(debtEndpoint.parameters[0].description).toBe('Branch ID for debt check');
    expect(debtEndpoint.parameters[0].examples).toHaveLength(1);
    expect(debtEndpoint.parameters[0].examples[0].name).toBe('withDebt');
    expect(debtEndpoint.parameters[0].examples[0].value).toBe(666666666666666);

    // Sixth endpoint overrides with orders-specific example
    const ordersEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get branch orders');
    expect(ordersEndpoint.parameters).toHaveLength(1);
    expect(ordersEndpoint.parameters[0].description).toBe('Branch ID for orders');
    expect(ordersEndpoint.parameters[0].examples).toHaveLength(1);
    expect(ordersEndpoint.parameters[0].examples[0].name).toBe('recentOrders');
    expect(ordersEndpoint.parameters[0].examples[0].value).toBe(777777777777777);

    // Seventh endpoint overrides with statement-specific example
    const statementEndpoint = branchesResource.endpoints.find(e => e.summary === 'Generate branch statement');
    expect(statementEndpoint.parameters).toHaveLength(1);
    expect(statementEndpoint.parameters[0].description).toBe('Branch ID for statement generation');
    expect(statementEndpoint.parameters[0].examples).toHaveLength(1);
    expect(statementEndpoint.parameters[0].examples[0].name).toBe('standard');
    expect(statementEndpoint.parameters[0].examples[0].value).toBe(888888888888888);

    // Eighth endpoint overrides with overdue-specific example
    const overdueEndpoint = branchesResource.endpoints.find(e => e.summary === 'Get overdue debts');
    expect(overdueEndpoint.parameters).toHaveLength(1);
    expect(overdueEndpoint.parameters[0].description).toBe('Branch ID for overdue debt check');
    expect(overdueEndpoint.parameters[0].examples).toHaveLength(1);
    expect(overdueEndpoint.parameters[0].examples[0].name).toBe('overdue');
    expect(overdueEndpoint.parameters[0].examples[0].value).toBe(999999999999999);
  });

  test('should resolve $ref in parameter examples from components', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/branches/{branchId}': {
          get: {
            tags: ['Branches'],
            summary: 'Get branch details',
            parameters: [
              {
                in: 'path',
                name: 'branchId',
                required: true,
                schema: {
                  type: 'integer',
                  format: 'int64',
                  minimum: 1
                },
                description: 'Branch ID',
                examples: {
                  valid: {
                    $ref: '#/components/examples/ValidBranchId'
                  },
                  invalid: {
                    $ref: '#/components/examples/InvalidBranchId'
                  }
                }
              }
            ],
            responses: {
              '200': { description: 'Success' }
            }
          }
        }
      },
      components: {
        examples: {
          ValidBranchId: {
            summary: 'Valid branch ID',
            description: 'A valid branch identifier for testing',
            value: 123456789012345
          },
          InvalidBranchId: {
            summary: 'Invalid branch ID',
            description: 'An invalid branch ID for error testing',
            value: 999999999999999
          }
        }
      }
    };

    processor.openApiSpec = spec;
    const data = processor.process(spec);

    expect(data.resources).toHaveLength(1);
    const branchesResource = data.resources[0];
    expect(branchesResource.endpoints).toHaveLength(1);

    const endpoint = branchesResource.endpoints[0];
    expect(endpoint.parameters).toHaveLength(1);
    expect(endpoint.parameters[0].name).toBe('branchId');
    expect(endpoint.parameters[0].hasExamples).toBe(true);
    expect(endpoint.parameters[0].examples).toHaveLength(2);

    // First example should be resolved from $ref
    expect(endpoint.parameters[0].examples[0].name).toBe('valid');
    expect(endpoint.parameters[0].examples[0].summary).toBe('Valid branch ID');
    expect(endpoint.parameters[0].examples[0].description).toBe('A valid branch identifier for testing');
    expect(endpoint.parameters[0].examples[0].value).toBe(123456789012345);

    // Second example should also be resolved from $ref
    expect(endpoint.parameters[0].examples[1].name).toBe('invalid');
    expect(endpoint.parameters[0].examples[1].summary).toBe('Invalid branch ID');
    expect(endpoint.parameters[0].examples[1].description).toBe('An invalid branch ID for error testing');
    expect(endpoint.parameters[0].examples[1].value).toBe(999999999999999);
  });

  test('should override parameter examples at operation level (OpenAPI 3.1.0)', () => {
    const spec = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/search': {
          parameters: [
            {
              name: 'query',
              in: 'query',
              schema: { type: 'string' },
              examples: {
                default: {
                  summary: 'Default search',
                  description: 'Standard search query',
                  value: 'general search'
                },
                advanced: {
                  summary: 'Advanced search',
                  value: 'field:value AND field2:value2'
                }
              }
            }
          ],
          get: {
            tags: ['Search'],
            summary: 'Basic search',
            responses: {
              '200': { description: 'Success' }
            }
          },
          post: {
            tags: ['Search'],
            summary: 'Advanced search with override',
            parameters: [
              {
                name: 'query',
                in: 'query',
                schema: { type: 'string' },
                examples: {
                  complex: {
                    summary: 'Complex query override',
                    description: 'Overrides path-level examples for POST',
                    value: '(field1:value1 OR field2:value2) AND field3:value3'
                  },
                  simple: {
                    summary: 'Simple override',
                    value: 'overridden simple query'
                  }
                }
              }
            ],
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
    const searchResource = data.resources[0];
    expect(searchResource.name).toBe('Search');
    expect(searchResource.endpoints).toHaveLength(2);

    // GET endpoint should use path-level parameter examples
    const getEndpoint = searchResource.endpoints.find(e => e.method === 'GET');
    expect(getEndpoint.parameters).toHaveLength(1);
    expect(getEndpoint.parameters[0].name).toBe('query');
    expect(getEndpoint.parameters[0].examples).toHaveLength(2);
    expect(getEndpoint.parameters[0].examples[0].name).toBe('default');
    expect(getEndpoint.parameters[0].examples[0].summary).toBe('Default search');
    expect(getEndpoint.parameters[0].examples[0].value).toBe('general search');
    expect(getEndpoint.parameters[0].examples[1].name).toBe('advanced');
    expect(getEndpoint.parameters[0].examples[1].value).toBe('field:value AND field2:value2');

    // POST endpoint should use operation-level parameter examples (override)
    const postEndpoint = searchResource.endpoints.find(e => e.method === 'POST');
    expect(postEndpoint.parameters).toHaveLength(1);
    expect(postEndpoint.parameters[0].name).toBe('query');
    expect(postEndpoint.parameters[0].examples).toHaveLength(2);
    expect(postEndpoint.parameters[0].examples[0].name).toBe('complex');
    expect(postEndpoint.parameters[0].examples[0].summary).toBe('Complex query override');
    expect(postEndpoint.parameters[0].examples[0].description).toBe('Overrides path-level examples for POST');
    expect(postEndpoint.parameters[0].examples[0].value).toBe('(field1:value1 OR field2:value2) AND field3:value3');
    expect(postEndpoint.parameters[0].examples[1].name).toBe('simple');
    expect(postEndpoint.parameters[0].examples[1].value).toBe('overridden simple query');
  });
});
