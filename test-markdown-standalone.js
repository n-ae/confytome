#!/usr/bin/env node

/**
 * Test script for @confytome/markdown standalone functionality
 */

import { StandaloneMarkdownGenerator } from './packages/markdown/standalone-generator.js';
import fs from 'node:fs';

// Create a test OpenAPI spec
const testSpec = {
  "openapi": "3.0.3",
  "info": {
    "title": "Test API",
    "version": "1.0.0",
    "description": "A simple test API for markdown generation"
  },
  "servers": [
    {
      "url": "https://api.example.com/v1",
      "description": "Test server"
    }
  ],
  "paths": {
    "/users": {
      "get": {
        "summary": "Get all users",
        "description": "Retrieve a list of all users",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "example": [{"id": 1, "name": "John Doe"}]
              }
            }
          }
        }
      },
      "post": {
        "summary": "Create user",
        "description": "Create a new user",
        "requestBody": {
          "content": {
            "application/json": {
              "example": {"name": "Jane Doe"}
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "example": {"id": 2, "name": "Jane Doe"}
              }
            }
          }
        }
      }
    }
  }
};

async function testMarkdownGeneration() {
  console.log('🧪 Testing @confytome/markdown standalone functionality...');
  console.log('');

  try {
    // Create test directory
    const testDir = './test-markdown-output';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Write test OpenAPI spec
    const specPath = `${testDir}/api-spec.json`;
    fs.writeFileSync(specPath, JSON.stringify(testSpec, null, 2));
    console.log(`📄 Created test OpenAPI spec: ${specPath}`);

    // Create generator
    const generator = new StandaloneMarkdownGenerator(testDir);

    // Initialize
    console.log('🔧 Initializing generator...');
    const validation = await generator.initialize();
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    console.log('✅ Generator initialized successfully');

    // Generate markdown
    console.log('📝 Generating markdown documentation...');
    const result = await generator.generate({
      excludeBrand: false
    });

    if (result.success) {
      console.log('');
      console.log('🎉 Test completed successfully!');
      console.log(`📄 Generated: ${result.outputPath}`);
      console.log(`📏 File size: ${result.size} bytes`);
      console.log(`🔗 Endpoints: ${result.stats.endpoints}`);
      console.log(`📚 Resources: ${result.stats.resources}`);
      
      // Show a snippet of the generated content
      const content = fs.readFileSync(result.outputPath, 'utf8');
      const preview = content.substring(0, 200);
      console.log('');
      console.log('📋 Preview:');
      console.log('─'.repeat(50));
      console.log(preview + (content.length > 200 ? '...' : ''));
      console.log('─'.repeat(50));
      
    } else {
      console.error('❌ Test failed');
      console.error(`   Error: ${result.stats?.error || 'Unknown error'}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMarkdownGeneration();