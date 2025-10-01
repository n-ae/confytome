/**
 * Parameter Groups with Headers Tests
 *
 * Verifies that:
 * 1. Parameter groups with header parameters are supported
 * 2. Headers from parameter groups are not duplicated
 * 3. When combining parameter group headers + auth headers = correct total (not multiplied)
 *
 * Issue: Having 2 headers in a parameter group + 1 Authorization header
 * should result in 3 headers in code sample, not 9 (3 * 3)
 */

import { StandaloneConfluenceGenerator } from '../standalone-generator.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('Confluence Generator - Parameter Groups with Headers', () => {
  let testDir;
  let outputDir;
  let specPath;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'confluence-param-groups-headers-test-'));
    outputDir = path.join(testDir, 'output');
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should not duplicate headers from parameter groups', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Header Parameter Groups API',
        version: '1.0.0'
      },
      components: {
        parameters: {
          ApiKeyHeader: {
            name: 'X-API-Key',
            in: 'header',
            required: true,
            description: 'API Key for authentication',
            schema: { type: 'string' }
          },
          ClientIdHeader: {
            name: 'X-Client-Id',
            in: 'header',
            required: true,
            description: 'Client identifier',
            schema: { type: 'string' }
          }
        }
      },
      paths: {
        '/api/users': {
          parameters: [
            { $ref: '#/components/parameters/ApiKeyHeader' },
            { $ref: '#/components/parameters/ClientIdHeader' }
          ],
          get: {
            tags: ['Users'],
            summary: 'Get users',
            responses: {
              '200': { description: 'Success' }
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

    // Count header occurrences in curl command
    const curlSection = markdownContent.split('```shell')[1].split('```')[0];
    const apiKeyMatches = (curlSection.match(/X-API-Key/g) || []).length;
    const clientIdMatches = (curlSection.match(/X-Client-Id/g) || []).length;

    // Each header should appear exactly ONCE in curl command
    expect(apiKeyMatches).toBe(1);
    expect(clientIdMatches).toBe(1);

    // Verify curl structure
    expect(curlSection).toContain('-H \'X-API-Key: value\'');
    expect(curlSection).toContain('-H \'X-Client-Id: value\'');
  });

  test('should handle 2 header params in group + 1 auth header = 3 total (not 9)', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Combined Headers API',
        version: '1.0.0'
      },
      components: {
        parameters: {
          ApiKeyHeader: {
            name: 'X-API-Key',
            in: 'header',
            required: true,
            description: 'API Key',
            schema: { type: 'string' }
          },
          ClientIdHeader: {
            name: 'X-Client-Id',
            in: 'header',
            required: true,
            description: 'Client ID',
            schema: { type: 'string' }
          }
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      paths: {
        '/api/protected': {
          parameters: [
            { $ref: '#/components/parameters/ApiKeyHeader' },
            { $ref: '#/components/parameters/ClientIdHeader' }
          ],
          get: {
            tags: ['Protected'],
            summary: 'Get protected resource',
            responses: {
              '200': { description: 'Success' }
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

    // Extract curl command section
    const curlSection = markdownContent.split('```shell')[1].split('```')[0];

    // Count ALL -H occurrences (including Content-Type, Accept, etc.)
    const allHeaderLines = (curlSection.match(/-H /g) || []).length;

    // Count specific headers
    const apiKeyCount = (curlSection.match(/X-API-Key/g) || []).length;
    const clientIdCount = (curlSection.match(/X-Client-Id/g) || []).length;
    const authCount = (curlSection.match(/Authorization/g) || []).length;

    // CRITICAL: Each header should appear exactly ONCE
    expect(apiKeyCount).toBe(1);
    expect(clientIdCount).toBe(1);
    expect(authCount).toBe(1);

    // Total unique headers (not counting Content-Type/Accept if present)
    const customHeaderCount = apiKeyCount + clientIdCount + authCount;
    expect(customHeaderCount).toBe(3); // NOT 9!
  });

  test('should handle mixed parameter group refs with operation-level headers', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Mixed Headers API',
        version: '1.0.0'
      },
      components: {
        parameters: {
          ApiKeyHeader: {
            name: 'X-API-Key',
            in: 'header',
            required: true,
            schema: { type: 'string' }
          }
        }
      },
      paths: {
        '/api/data': {
          parameters: [
            { $ref: '#/components/parameters/ApiKeyHeader' }
          ],
          get: {
            tags: ['Data'],
            summary: 'Get data',
            parameters: [
              {
                name: 'X-Request-Id',
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
    const curlSection = markdownContent.split('```shell')[1].split('```')[0];

    const apiKeyCount = (curlSection.match(/X-API-Key/g) || []).length;
    const requestIdCount = (curlSection.match(/X-Request-Id/g) || []).length;

    // Each header should appear exactly once
    expect(apiKeyCount).toBe(1);
    expect(requestIdCount).toBe(1);
  });

  test('should handle parameter group with 3 headers', async() => {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Three Headers API',
        version: '1.0.0'
      },
      components: {
        parameters: {
          Header1: {
            name: 'X-Header-1',
            in: 'header',
            schema: { type: 'string' }
          },
          Header2: {
            name: 'X-Header-2',
            in: 'header',
            schema: { type: 'string' }
          },
          Header3: {
            name: 'X-Header-3',
            in: 'header',
            schema: { type: 'string' }
          }
        }
      },
      paths: {
        '/api/test': {
          parameters: [
            { $ref: '#/components/parameters/Header1' },
            { $ref: '#/components/parameters/Header2' },
            { $ref: '#/components/parameters/Header3' }
          ],
          get: {
            tags: ['Test'],
            summary: 'Test endpoint',
            responses: {
              '200': { description: 'Success' }
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
    const curlSection = markdownContent.split('```shell')[1].split('```')[0];

    const header1Count = (curlSection.match(/X-Header-1/g) || []).length;
    const header2Count = (curlSection.match(/X-Header-2/g) || []).length;
    const header3Count = (curlSection.match(/X-Header-3/g) || []).length;

    // Each should appear exactly once, not 3*3=9 times
    expect(header1Count).toBe(1);
    expect(header2Count).toBe(1);
    expect(header3Count).toBe(1);
  });
});
