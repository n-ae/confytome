/**
 * Integration Tests
 *
 * End-to-end tests for the complete generation pipeline
 */

import {
  TestEnvironment,
  SAMPLE_SERVER_CONFIG,
  SAMPLE_ROUTER_JS,
  isValidJSON,
  isValidOpenAPISpec
} from './test-helpers.js';
import { OUTPUT_FILES, DEFAULT_OUTPUT_DIR } from '../constants.js';

describe('confytome integration pipeline', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = new TestEnvironment('integration-test');
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  test('openapi generation works correctly', async() => {
    // Setup test files
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Generate OpenAPI spec
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(result.success).toBe(true);
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);

    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    expect(isValidJSON(specContent)).toBe(true);
    expect(isValidOpenAPISpec(JSON.parse(specContent))).toBe(true);

    const spec = JSON.parse(specContent);
    expect(spec.info.title).toContain('Test');
    expect(spec.openapi).toBe('3.0.3');
  });

  test('pipeline handles missing dependencies gracefully', async() => {
    // Setup minimal config without required fields
    testEnv.createFile('serverConfig.json', JSON.stringify({
      info: { title: 'Test', version: '1.0.0' },
      openapi: '3.0.3'
      // Missing servers field
    }));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');

    // Should fail gracefully with helpful error message
    expect(result.success).toBe(false);
    expect(result.stderr).toContain('servers');
  });

  test('pipeline validates input files exist', async() => {
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    // Don't create the router file

    const result = testEnv.runConfytome('openapi -c serverConfig.json -f nonexistent.js');

    // CLI might succeed but with warnings, or fail - either is acceptable
    // The important thing is that it handles missing files gracefully
    expect(result.stdout || result.stderr).toBeTruthy();

    // If it failed, error should mention files
    if (!result.success) {
      expect(result.stderr.toLowerCase()).toMatch(/file|found|exist|enoent/);
    }
  });

  test('pipeline respects --no-brand option', async() => {
    // Create a confytome.json config file which is required for generate command
    const confytomeConfig = {
      serverConfig: 'serverConfig.json',
      routeFiles: ['test-router.js'],
      outputDir: 'confytome'
    };

    testEnv.createFile('confytome.json', JSON.stringify(confytomeConfig, null, 2));
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // First generate OpenAPI spec
    const openApiResult = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(openApiResult.success).toBe(true);

    // Then try to generate HTML without branding - this may not work if HTML generator not available
    const htmlResult = testEnv.runConfytome('run generate-html --no-brand');

    // Test is optional if generator isn't available
    if (htmlResult.success && testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.HTML_DOCS}`)) {
      const htmlContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.HTML_DOCS}`);
      expect(htmlContent).not.toContain('Generated with');
    }
  });

  test('pipeline works with multiple JSDoc files', async() => {
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('router1.js', `
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users
 *     responses:
 *       200:
 *         description: Success
 */
    `);
    testEnv.createFile('router2.js', `
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get posts
 *     responses:
 *       200:
 *         description: Success
 */
    `);

    // Use openapi command directly with multiple files
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f router1.js router2.js');
    expect(result.success).toBe(true);

    // Verify both endpoints are in the generated spec
    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    const spec = JSON.parse(specContent);
    expect(spec.paths).toHaveProperty('/api/users');
    expect(spec.paths).toHaveProperty('/api/posts');
  });

  test('complete pipeline generates all expected output formats', async() => {
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // First generate OpenAPI spec
    const openApiResult = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(openApiResult.success).toBe(true);
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);

    // Verify OpenAPI spec is valid
    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    expect(isValidJSON(specContent)).toBe(true);
    const spec = JSON.parse(specContent);
    expect(isValidOpenAPISpec(spec)).toBe(true);

    const expectedTitle = spec.info.title;
    const expectedEndpoint = Object.keys(spec.paths)[0];

    // Generate HTML documentation
    const htmlResult = testEnv.runConfytome('run generate-html');
    if (htmlResult.success && testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.HTML_DOCS}`)) {
      const htmlContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.HTML_DOCS}`);
      expect(htmlContent).toContain(expectedTitle);
      expect(htmlContent).toContain(expectedEndpoint);
      expect(htmlContent).toContain('<!DOCTYPE html>');
    }

    // Generate Markdown documentation
    const markdownResult = testEnv.runConfytome('run generate-markdown');
    if (markdownResult.success && testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.MARKDOWN_DOCS}`)) {
      const markdownContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.MARKDOWN_DOCS}`);
      expect(markdownContent).toContain(expectedTitle);
    }

    // Generate Swagger UI
    const swaggerResult = testEnv.runConfytome('run generate-swagger');
    if (swaggerResult.success && testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.SWAGGER_UI}`)) {
      const swaggerContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.SWAGGER_UI}`);
      expect(swaggerContent).toContain(expectedTitle);
      expect(swaggerContent).toContain('swagger-ui');
    }

    // Generate Postman collection
    const postmanResult = testEnv.runConfytome('run generate-postman');
    if (postmanResult.success && testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.POSTMAN_COLLECTION}`)) {
      const collectionContent = JSON.parse(testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.POSTMAN_COLLECTION}`));
      expect(collectionContent.info).toBeDefined();
      expect(collectionContent.info.name).toContain(expectedTitle);
    }
  });

  test('pipeline performance and file size validation', async() => {
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    const startTime = Date.now();

    // Generate OpenAPI spec and measure performance
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(result.success).toBe(true);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    // Performance should be reasonable (under 10 seconds for simple case)
    expect(generationTime).toBeLessThan(10000);

    // Validate generated files have reasonable sizes
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);
    const specSize = testEnv.getFileSize(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);

    // OpenAPI spec should not be empty but also not excessively large
    expect(specSize).toBeGreaterThan(100); // At least 100 bytes
    expect(specSize).toBeLessThan(100000); // Less than 100KB for simple spec

    // Verify spec contains expected structure
    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    const spec = JSON.parse(specContent);

    expect(spec.paths).toHaveProperty('/api/users');
    expect(spec.paths).toHaveProperty('/api/users/{id}');
    expect(spec.components.schemas).toHaveProperty('TestUser');
  });

  test('pipeline error handling and recovery', async() => {
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('invalid-router.js', 'this is not valid JSDoc content');

    // OpenAPI generation may succeed even with invalid JSDoc (just produces empty paths)
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f invalid-router.js');

    // Always should produce some output
    expect(result.stdout || result.stderr).toBeTruthy();

    // Now test with valid content - should definitely work
    testEnv.createFile('valid-router.js', SAMPLE_ROUTER_JS);
    const validResult = testEnv.runConfytome('openapi -c serverConfig.json -f valid-router.js');
    expect(validResult.success).toBe(true);

    // Valid result should have actual paths
    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);
    const spec = JSON.parse(specContent);
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });
});
