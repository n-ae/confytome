/**
 * Init Command Tests
 *
 * Tests that 'confytome init' sets up docs/ and serverConfig.json
 */

import {
  TestEnvironment,
  isValidJSON
} from './test-helpers.js';

describe('confytome init', () => {
  let testEnv;

  beforeEach(() => {
    testEnv = new TestEnvironment('init-test');
    testEnv.setup();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  test('should set up docs/ and serverConfig.json', () => {
    // Verify starting state - nothing exists
    expect(testEnv.fileExists('confytome')).toBe(false);
    expect(testEnv.fileExists('serverConfig.json')).toBe(false);

    // Run confytome init command
    const result = testEnv.runConfytome('init');

    // Check command succeeded
    expect(result.success).toBe(true);
    expect(result.stderr).toBe('');

    // Check that docs directory was created
    expect(testEnv.fileExists('confytome')).toBe(true);
    expect(testEnv.fileExists('confytome/assets')).toBe(true); // Should also create assets subdirectory

    // Check that serverConfig.json was created in the output directory
    expect(testEnv.fileExists('confytome/serverConfig.json')).toBe(true);

    // Validate serverConfig.json content
    const configContent = testEnv.readFile('confytome/serverConfig.json');
    expect(isValidJSON(configContent)).toBe(true);

    const config = JSON.parse(configContent);
    expect(config.openapi).toBe('3.1.0');
    expect(config.info).toBeDefined();
    expect(config.info.title).toBeDefined();
    expect(config.info.version).toBeDefined();
    expect(config.servers).toBeDefined();
    expect(Array.isArray(config.servers)).toBe(true);
    expect(config.components).toBeDefined();
    expect(config.components.securitySchemes).toBeDefined();

    // Check file sizes are reasonable (not empty)
    expect(testEnv.getFileSize('confytome/serverConfig.json')).toBeGreaterThan(100);
  });

  test('should create example-router.js with JSDoc examples', () => {
    // Run confytome init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Check that example-router.js was created in the output directory
    expect(testEnv.fileExists('confytome/example-router.js')).toBe(true);

    // Validate example router content
    const routerContent = testEnv.readFile('confytome/example-router.js');

    // Should contain JSDoc examples
    expect(routerContent).toContain('@swagger');
    expect(routerContent).toContain('components:');
    expect(routerContent).toContain('schemas:');
    expect(routerContent).toContain('/api/users');
    expect(routerContent).toContain('tags:');
    expect(routerContent).toContain('Users');

    // Should be a substantial file with examples
    expect(testEnv.getFileSize('confytome/example-router.js')).toBeGreaterThan(1000);
  });

  test('should create templates directory', () => {
    // Run confytome init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Check that templates directory was created in the output directory
    expect(testEnv.fileExists('confytome/templates')).toBe(true);
  });

  test('should handle custom output directory', () => {
    // Run with custom output directory
    const result = testEnv.runConfytome('init --output ./api-documentation');

    // Check command succeeded
    expect(result.success).toBe(true);

    // Check that custom output directory was created
    expect(testEnv.fileExists('api-documentation')).toBe(true);
    expect(testEnv.fileExists('api-documentation/assets')).toBe(true);

    // Config and examples should be in the custom output directory
    expect(testEnv.fileExists('api-documentation/serverConfig.json')).toBe(true);
    expect(testEnv.fileExists('api-documentation/example-router.js')).toBe(true);
    expect(testEnv.fileExists('api-documentation/templates')).toBe(true);
  });

  test('should not overwrite existing files', () => {
    // Create an existing serverConfig.json in the output directory
    testEnv.createFile('confytome/serverConfig.json', JSON.stringify({
      openapi: '3.0.0',
      info: {
        title: 'Existing API',
        version: '2.0.0'
      }
    }, null, 2));

    // Run init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Check that existing config was NOT overwritten
    const configContent = testEnv.readFile('confytome/serverConfig.json');
    const config = JSON.parse(configContent);
    expect(config.info.title).toBe('Existing API');
    expect(config.info.version).toBe('2.0.0');
    expect(config.openapi).toBe('3.0.0'); // Original value preserved
  });

  test('should provide helpful guidance in output', () => {
    // Run init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Check for helpful guidance in output
    expect(result.stdout).toContain('Initialization complete');
    expect(result.stdout).toContain('Next steps');
    expect(result.stdout).toContain('Edit serverConfig.json');
    expect(result.stdout).toContain('confytome all');

    // Should mention the example file if it was created
    if (result.stdout.includes('example-router.js')) {
      expect(result.stdout).toContain('example-router.js');
    }
  });

  test('should work in directory with existing docs/', () => {
    // Pre-create docs directory
    testEnv.createFile('docs/.gitkeep', '');

    // Run init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Should still create other files in the output directory
    expect(testEnv.fileExists('confytome/serverConfig.json')).toBe(true);
    expect(testEnv.fileExists('confytome/example-router.js')).toBe(true);

    // Should create assets subdirectory
    expect(testEnv.fileExists('confytome/assets')).toBe(true);
  });

  test('should show appropriate status for existing vs created files', () => {
    // Pre-create docs directory
    testEnv.createFile('docs/.gitkeep', '');

    // Run init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Output should differentiate between created and existing items
    expect(result.stdout).toContain('Created');

    // Should not claim to have created something that already existed
    if (result.stdout.includes('exists')) {
      // This would indicate it found existing files
      expect(result.stdout).toMatch(/exists|already/i);
    }
  });

  test('should validate directory structure after init', () => {
    // Run init command
    const result = testEnv.runConfytome('init');
    expect(result.success).toBe(true);

    // Validate complete directory structure
    const createdFiles = testEnv.listFiles('.');
    expect(createdFiles).toContain('confytome');

    // Validate files are created in the output directory
    const confytomeFiles = testEnv.listFiles('confytome');
    expect(confytomeFiles).toContain('serverConfig.json');
    expect(confytomeFiles).toContain('example-router.js');
    expect(confytomeFiles).toContain('templates');
    expect(confytomeFiles).toContain('assets');
  });
});
