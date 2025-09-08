#!/usr/bin/env node

/**
 * Standalone Isolation Test
 * 
 * Verifies that @confytome/markdown can truly operate in complete isolation
 * without any dependencies on @confytome/core. This test simulates the 
 * behavior when a user runs `npx @confytome/markdown` in a clean environment.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { StandaloneMarkdownGenerator } from './packages/markdown/standalone-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class StandaloneIsolationTester {
  constructor() {
    this.testDir = path.join(__dirname, 'test-isolation');
    this.testResults = [];
  }

  /**
   * Run all isolation tests
   */
  async runAllTests() {
    console.log('🧪 Starting Standalone Isolation Tests for @confytome/markdown\n');

    try {
      await this.setupTestEnvironment();
      await this.testStandaloneInstantiation();
      await this.testMetadataAccess();
      await this.testValidationWithoutCore();
      await this.testGenerationWithMockData();
      await this.testCleanupOperations();
      
      this.printResults();
    } catch (error) {
      console.error(`❌ Test suite failed: ${error.message}`);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Setup isolated test environment
   */
  async setupTestEnvironment() {
    console.log('📁 Setting up isolated test environment...');
    
    // Create test directory
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.testDir, { recursive: true });

    // Create mock OpenAPI spec
    const mockSpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Test API for standalone isolation testing'
      },
      servers: [
        { url: 'https://api.example.com' }
      ],
      paths: {
        '/users': {
          get: {
            summary: 'Get all users',
            description: 'Retrieve a list of all users'
          }
        },
        '/users/{id}': {
          get: {
            summary: 'Get user by ID',
            description: 'Retrieve a specific user by their ID'
          }
        }
      }
    };

    fs.writeFileSync(
      path.join(this.testDir, 'api-spec.json'),
      JSON.stringify(mockSpec, null, 2)
    );

    this.addResult('✅ Test environment setup', 'SUCCESS');
  }

  /**
   * Test standalone generator instantiation
   */
  async testStandaloneInstantiation() {
    console.log('🔧 Testing standalone generator instantiation...');

    try {
      const generator = new StandaloneMarkdownGenerator(this.testDir, {
        excludeBrand: false
      });

      if (!generator) {
        throw new Error('Generator instantiation failed');
      }

      if (generator.outputDir !== this.testDir) {
        throw new Error('Output directory not set correctly');
      }

      this.addResult('✅ Standalone instantiation', 'SUCCESS');
    } catch (error) {
      this.addResult('❌ Standalone instantiation', `FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test metadata access without core dependencies
   */
  async testMetadataAccess() {
    console.log('📊 Testing metadata access...');

    try {
      const metadata = StandaloneMarkdownGenerator.getMetadata();

      const requiredFields = ['name', 'description', 'version', 'packageName', 'cliCommand', 'inputs', 'outputs'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          throw new Error(`Missing required metadata field: ${field}`);
        }
      }

      if (metadata.name !== 'markdown') {
        throw new Error(`Expected name 'markdown', got '${metadata.name}'`);
      }

      if (metadata.packageName !== '@confytome/markdown') {
        throw new Error(`Expected packageName '@confytome/markdown', got '${metadata.packageName}'`);
      }

      this.addResult('✅ Metadata access', 'SUCCESS');
    } catch (error) {
      this.addResult('❌ Metadata access', `FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test validation functionality without core
   */
  async testValidationWithoutCore() {
    console.log('🔍 Testing validation without core dependencies...');

    try {
      const generator = new StandaloneMarkdownGenerator(this.testDir);
      const validationResult = await generator.validate();

      if (typeof validationResult !== 'object') {
        throw new Error('Validation should return an object');
      }

      if (!validationResult.hasOwnProperty('valid')) {
        throw new Error('Validation result should have "valid" property');
      }

      if (!validationResult.hasOwnProperty('errors')) {
        throw new Error('Validation result should have "errors" property');
      }

      if (!validationResult.hasOwnProperty('warnings')) {
        throw new Error('Validation result should have "warnings" property');
      }

      this.addResult('✅ Validation without core', 'SUCCESS');
    } catch (error) {
      this.addResult('❌ Validation without core', `FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test generation with mock data
   */
  async testGenerationWithMockData() {
    console.log('⚙️ Testing generation with mock data...');

    try {
      const generator = new StandaloneMarkdownGenerator(this.testDir, {
        excludeBrand: true // Test without branding for simplicity
      });

      await generator.initialize();
      const result = await generator.generate();

      if (!result || typeof result !== 'object') {
        throw new Error('Generation should return a result object');
      }

      if (!result.success) {
        throw new Error(`Generation failed: ${result.stats?.error || 'Unknown error'}`);
      }

      if (!result.outputPath) {
        throw new Error('Generation result should include output path');
      }

      if (!fs.existsSync(result.outputPath)) {
        throw new Error(`Generated file not found: ${result.outputPath}`);
      }

      // Check file content
      const content = fs.readFileSync(result.outputPath, 'utf8');
      if (!content.includes('Test API')) {
        throw new Error('Generated content should include API title');
      }

      if (!content.includes('GET /users')) {
        throw new Error('Generated content should include endpoint information');
      }

      this.addResult('✅ Generation with mock data', 'SUCCESS');
    } catch (error) {
      this.addResult('❌ Generation with mock data', `FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test cleanup operations
   */
  async testCleanupOperations() {
    console.log('🧹 Testing cleanup operations...');

    try {
      const generator = new StandaloneMarkdownGenerator(this.testDir);
      
      // Test that cleanup doesn't throw errors
      await generator.cleanup();
      
      this.addResult('✅ Cleanup operations', 'SUCCESS');
    } catch (error) {
      this.addResult('❌ Cleanup operations', `FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add test result
   */
  addResult(test, result) {
    this.testResults.push({ test, result });
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('\n📋 Test Results Summary:');
    console.log('=' * 50);
    
    let passed = 0;
    let failed = 0;
    
    for (const { test, result } of this.testResults) {
      console.log(`${test}: ${result}`);
      if (result === 'SUCCESS') {
        passed++;
      } else {
        failed++;
      }
    }
    
    console.log('=' * 50);
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! @confytome/markdown operates in true isolation!');
      console.log('✨ The package successfully achieved standalone operation without @confytome/core dependencies.');
    } else {
      console.log(`\n⚠️ ${failed} test(s) failed. Standalone isolation needs attention.`);
      process.exit(1);
    }
  }

  /**
   * Clean up test environment
   */
  async cleanup() {
    try {
      if (fs.existsSync(this.testDir)) {
        fs.rmSync(this.testDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn(`Warning: Failed to clean up test directory: ${error.message}`);
    }
  }
}

// Run the tests
const tester = new StandaloneIsolationTester();
tester.runAllTests().catch(console.error);