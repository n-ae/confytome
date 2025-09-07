/**
 * OpenAPI Command Tests
 *
 * Tests that 'confytome openapi' produces a valid OpenAPI spec
 */

import {
  TestEnvironment,
  SAMPLE_SERVER_CONFIG,
  SAMPLE_ROUTER_JS,
  isValidJSON,
  isValidOpenAPISpec
} from './test-helpers.js';
import { OUTPUT_FILES, DEFAULT_OUTPUT_DIR } from '../constants.js';

describe('confytome openapi', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = new TestEnvironment('openapi-test');
    testEnv.setup();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  test('should produce a valid OpenAPI spec file', () => {
    // Create test files
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Run confytome openapi command
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');

    // Check command succeeded
    expect(result.success).toBe(true);
    expect(result.stderr).toBe('');

    // Check that OpenAPI spec was created
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);

    // Read and validate the generated spec
    const specContent = testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`);

    // Should be valid JSON
    expect(isValidJSON(specContent)).toBe(true);

    // Parse and validate OpenAPI structure
    const spec = JSON.parse(specContent);
    expect(isValidOpenAPISpec(spec)).toBe(true);

    // Check basic OpenAPI properties
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toBe('Test API');
    expect(spec.info.version).toBe('1.0.0');
    expect(spec.paths).toBeDefined();

    // Check that paths from JSDoc were included
    expect(spec.paths['/api/users']).toBeDefined();
    expect(spec.paths['/api/users/{id}']).toBeDefined();

    // Check that GET operations were created
    expect(spec.paths['/api/users'].get).toBeDefined();
    expect(spec.paths['/api/users/{id}'].get).toBeDefined();

    // Check that components/schemas were included
    expect(spec.components).toBeDefined();
    expect(spec.components.schemas).toBeDefined();
    expect(spec.components.schemas.TestUser).toBeDefined();

    // Check that security schemes are preserved from config
    expect(spec.components.securitySchemes).toBeDefined();
    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();

    // Verify file is not empty (reasonable size)
    expect(testEnv.getFileSize(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBeGreaterThan(100);
  });

  test('should create docs directory if it does not exist', () => {
    // Create test files (no docs directory exists yet)
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Verify docs directory doesn't exist
    expect(testEnv.fileExists('confytome')).toBe(false);

    // Run confytome openapi command
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');

    // Check command succeeded
    expect(result.success).toBe(true);

    // Check that docs directory was created
    expect(testEnv.fileExists('confytome')).toBe(true);
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);
  });

  test('should fail gracefully with invalid server config', () => {
    // Create invalid server config (invalid JSON)
    testEnv.createFile('serverConfig.json', '{ "invalid": json }');
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Run confytome openapi command
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');

    // Command should fail
    expect(result.success).toBe(false);
    expect(result.stderr).toContain('JSON');
  });

  test('should fail gracefully with missing files', () => {
    // Try to run without creating the required files
    const result = testEnv.runConfytome('openapi -c nonexistent-config.json -f nonexistent-router.js');

    // Command should fail
    expect(result.success).toBe(false);
    expect(result.stderr.toLowerCase()).toMatch(/not found|file|config/);
  });

  test('should handle multiple JSDoc files', () => {
    // Create server config
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));

    // Create multiple router files
    testEnv.createFile('users-router.js', SAMPLE_ROUTER_JS);
    testEnv.createFile('posts-router.js', `
      /**
       * @swagger
       * /api/posts:
       *   get:
       *     tags:
       *       - Posts
       *     summary: Get all posts
       *     responses:
       *       200:
       *         description: Success
       */
      function getAllPosts(req, res) {}
      module.exports = { getAllPosts };
    `);

    // Run with multiple files
    const result = testEnv.runConfytome('openapi -c serverConfig.json -f users-router.js posts-router.js');

    // Check command succeeded
    expect(result.success).toBe(true);
    expect(testEnv.fileExists(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`)).toBe(true);

    // Check that both sets of endpoints are included
    const spec = JSON.parse(testEnv.readFile(`${DEFAULT_OUTPUT_DIR}/${OUTPUT_FILES.OPENAPI_SPEC}`));
    expect(spec.paths['/api/users']).toBeDefined();
    expect(spec.paths['/api/posts']).toBeDefined();
  });
});
