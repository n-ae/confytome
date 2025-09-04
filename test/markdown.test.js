/**
 * Markdown Command Tests
 * 
 * Tests that 'confytome markdown' creates a non-empty api-docs.md
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  TestEnvironment, 
  SAMPLE_SERVER_CONFIG, 
  SAMPLE_ROUTER_JS,
  isValidJSON,
  isValidOpenAPISpec
} from './test-helpers.js';

describe('confytome markdown', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = new TestEnvironment('markdown-test');
    testEnv.setup();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  test('should create a non-empty api-docs.md file', () => {
    // First create an OpenAPI spec (required for markdown generation)
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Generate OpenAPI spec first
    const openApiResult = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(openApiResult.success).toBe(true);
    expect(testEnv.fileExists('docs/api-spec.json')).toBe(true);

    // Now run markdown generation
    const result = testEnv.runConfytome('markdown');

    // Check command succeeded
    expect(result.success).toBe(true);
    expect(result.stderr).toBe('');

    // Check that api-docs.md was created
    expect(testEnv.fileExists('docs/api-docs.md')).toBe(true);

    // Read and validate the generated markdown
    const markdownContent = testEnv.readFile('docs/api-docs.md');
    
    // Should not be empty
    expect(markdownContent.length).toBeGreaterThan(0);
    expect(markdownContent.trim().length).toBeGreaterThan(100); // Reasonable minimum size

    // Should contain expected sections
    expect(markdownContent).toContain('# Test API');
    expect(markdownContent).toContain('# Users'); // Tag from JSDoc (h1 in the current template)
    expect(markdownContent).toContain('/api/users'); // Endpoint from JSDoc
    expect(markdownContent).toContain('Get all users'); // Summary from JSDoc

    // Should be valid markdown format
    expect(markdownContent).toMatch(/^#\s+/m); // Should have heading
    expect(markdownContent).toContain('```'); // Should have code blocks

    // Check file size is reasonable (not just a few bytes)
    expect(testEnv.getFileSize('docs/api-docs.md')).toBeGreaterThan(500);
  });

  test('should fail when no OpenAPI spec exists', () => {
    // Try to run markdown without first generating OpenAPI spec
    const result = testEnv.runConfytome('markdown');

    // Command should fail
    expect(result.success).toBe(false);
    expect(result.stderr.toLowerCase()).toMatch(/not found|spec|api-spec/);
  });

  test('should include all API information in markdown', () => {
    // Create comprehensive test data
    const complexConfig = {
      ...SAMPLE_SERVER_CONFIG,
      info: {
        title: "Complex Test API",
        version: "2.1.0",
        description: "A complex API for comprehensive testing"
      }
    };

    testEnv.createFile('serverConfig.json', JSON.stringify(complexConfig, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Generate OpenAPI spec first
    const openApiResult = testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');
    expect(openApiResult.success).toBe(true);

    // Generate markdown
    const result = testEnv.runConfytome('markdown');
    expect(result.success).toBe(true);

    // Check detailed content
    const markdownContent = testEnv.readFile('docs/api-docs.md');
    
    // Should include API info
    expect(markdownContent).toContain('Complex Test API');
    expect(markdownContent).toContain('2.1.0');
    expect(markdownContent).toContain('comprehensive testing');

    // Should include endpoints with details
    expect(markdownContent).toContain('/api/users');
    expect(markdownContent).toContain('/api/users/{id}');
    expect(markdownContent).toContain('GET');
    
    // Should include schemas
    expect(markdownContent).toContain('TestUser');
    
    // Should include response codes
    expect(markdownContent).toMatch(/200|500/);
  });

  test('should generate timestamped output', () => {
    // Setup
    testEnv.createFile('serverConfig.json', JSON.stringify(SAMPLE_SERVER_CONFIG, null, 2));
    testEnv.createFile('test-router.js', SAMPLE_ROUTER_JS);

    // Generate OpenAPI spec first
    testEnv.runConfytome('openapi -c serverConfig.json -f test-router.js');

    // Generate markdown
    const result = testEnv.runConfytome('markdown');
    expect(result.success).toBe(true);

    // Check for timestamp (should be at the end of the file)
    const markdownContent = testEnv.readFile('docs/api-docs.md');
    expect(markdownContent).toMatch(/Generated:\s*\w+\s+\d{1,2},?\s+\d{4}/i);
  });
});
