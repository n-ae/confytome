#!/usr/bin/env node

/**
 * Test Suite: Standalone @confytome/markdown Package
 * 
 * Ensures that @confytome/markdown can operate independently without @confytome/core
 * dependency and generates correct Markdown documentation from OpenAPI specifications.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);
const testDir = path.join(projectRoot, '.test-standalone-markdown');

class StandaloneMarkdownTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Log test result
   */
  logResult(testName, success, details = '') {
    const status = success ? '✅' : '❌';
    const result = { testName, success, details, timestamp: Date.now() };
    this.results.push(result);
    console.log(`${status} ${testName}${details ? `: ${details}` : ''}`);
    return success;
  }

  /**
   * Setup isolated test environment
   */
  setupTestEnvironment() {
    console.log('🚀 Setting up standalone markdown test environment...');
    console.log('');

    // Clean and create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    return this.logResult('Test environment setup', true, `Created: ${testDir}`);
  }

  /**
   * Create comprehensive test OpenAPI specification
   */
  createTestOpenAPISpec() {
    const testSpec = {
      "openapi": "3.0.3",
      "info": {
        "title": "Standalone Markdown Test API",
        "version": "1.0.0",
        "description": "Comprehensive API for testing standalone markdown generation with various OpenAPI features",
        "contact": {
          "name": "Test Support",
          "email": "test@example.com"
        },
        "license": {
          "name": "MIT",
          "url": "https://opensource.org/licenses/MIT"
        }
      },
      "servers": [
        {
          "url": "https://api.test.com/v1",
          "description": "Production server"
        },
        {
          "url": "http://localhost:3000/v1", 
          "description": "Development server"
        }
      ],
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "components": {
        "securitySchemes": {
          "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
          }
        },
        "schemas": {
          "User": {
            "type": "object",
            "required": ["id", "name", "email"],
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64",
                "description": "User ID"
              },
              "name": {
                "type": "string",
                "description": "User's full name"
              },
              "email": {
                "type": "string",
                "format": "email",
                "description": "User's email address"
              },
              "role": {
                "type": "string",
                "enum": ["admin", "user", "guest"],
                "description": "User role"
              }
            },
            "example": {
              "id": 123,
              "name": "John Doe",
              "email": "john@example.com",
              "role": "user"
            }
          },
          "CreateUserRequest": {
            "type": "object",
            "required": ["name", "email"],
            "properties": {
              "name": {
                "type": "string",
                "description": "User's full name"
              },
              "email": {
                "type": "string",
                "format": "email",
                "description": "User's email address"
              },
              "role": {
                "type": "string",
                "enum": ["admin", "user", "guest"],
                "default": "user",
                "description": "User role"
              }
            },
            "example": {
              "name": "Jane Doe",
              "email": "jane@example.com",
              "role": "user"
            }
          },
          "Error": {
            "type": "object",
            "properties": {
              "code": {
                "type": "integer",
                "description": "Error code"
              },
              "message": {
                "type": "string",
                "description": "Error message"
              }
            }
          }
        }
      },
      "paths": {
        "/users": {
          "get": {
            "summary": "List all users",
            "description": "Retrieve a paginated list of all users in the system",
            "tags": ["Users"],
            "parameters": [
              {
                "name": "page",
                "in": "query",
                "description": "Page number for pagination",
                "required": false,
                "schema": {
                  "type": "integer",
                  "minimum": 1,
                  "default": 1
                }
              },
              {
                "name": "limit",
                "in": "query", 
                "description": "Number of users per page",
                "required": false,
                "schema": {
                  "type": "integer",
                  "minimum": 1,
                  "maximum": 100,
                  "default": 20
                }
              },
              {
                "name": "role",
                "in": "query",
                "description": "Filter by user role",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": ["admin", "user", "guest"]
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Successful response with user list",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/User"
                      }
                    },
                    "example": [
                      {
                        "id": 1,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "role": "admin"
                      },
                      {
                        "id": 2,
                        "name": "Jane Smith",
                        "email": "jane@example.com", 
                        "role": "user"
                      }
                    ]
                  }
                }
              },
              "400": {
                "description": "Bad request - invalid parameters",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    },
                    "example": {
                      "code": 400,
                      "message": "Invalid pagination parameters"
                    }
                  }
                }
              },
              "401": {
                "description": "Unauthorized - authentication required",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "summary": "Create a new user",
            "description": "Create a new user account in the system",
            "tags": ["Users"],
            "requestBody": {
              "description": "User data for creation",
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateUserRequest"
                  },
                  "example": {
                    "name": "Bob Wilson",
                    "email": "bob@example.com",
                    "role": "user"
                  }
                }
              }
            },
            "responses": {
              "201": {
                "description": "User created successfully",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    },
                    "example": {
                      "id": 3,
                      "name": "Bob Wilson",
                      "email": "bob@example.com",
                      "role": "user"
                    }
                  }
                }
              },
              "400": {
                "description": "Bad request - validation error",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    },
                    "example": {
                      "code": 400,
                      "message": "Invalid email format"
                    }
                  }
                }
              },
              "409": {
                "description": "Conflict - user already exists",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        },
        "/users/{id}": {
          "get": {
            "summary": "Get user by ID",
            "description": "Retrieve a specific user by their unique identifier",
            "tags": ["Users"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "User ID",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "User found",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              },
              "404": {
                "description": "User not found",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          },
          "put": {
            "summary": "Update user",
            "description": "Update an existing user's information",
            "tags": ["Users"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "User ID",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "requestBody": {
              "description": "Updated user data",
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateUserRequest"
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "User updated successfully",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              },
              "404": {
                "description": "User not found"
              },
              "400": {
                "description": "Bad request - validation error"
              }
            }
          },
          "delete": {
            "summary": "Delete user",
            "description": "Remove a user from the system",
            "tags": ["Users"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "User ID",
                "required": true,
                "schema": {
                  "type": "integer",
                  "format": "int64"
                }
              }
            ],
            "responses": {
              "204": {
                "description": "User deleted successfully"
              },
              "404": {
                "description": "User not found"
              },
              "403": {
                "description": "Forbidden - insufficient permissions"
              }
            }
          }
        },
        "/auth/login": {
          "post": {
            "summary": "User login",
            "description": "Authenticate user and return JWT token",
            "tags": ["Authentication"],
            "requestBody": {
              "description": "Login credentials",
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "required": ["email", "password"],
                    "properties": {
                      "email": {
                        "type": "string",
                        "format": "email",
                        "description": "User email"
                      },
                      "password": {
                        "type": "string",
                        "description": "User password"
                      }
                    },
                    "example": {
                      "email": "john@example.com",
                      "password": "securepassword123"
                    }
                  }
                }
              }
            },
            "responses": {
              "200": {
                "description": "Login successful",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "token": {
                          "type": "string",
                          "description": "JWT access token"
                        },
                        "user": {
                          "$ref": "#/components/schemas/User"
                        }
                      },
                      "example": {
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "user": {
                          "id": 1,
                          "name": "John Doe",
                          "email": "john@example.com",
                          "role": "admin"
                        }
                      }
                    }
                  }
                }
              },
              "401": {
                "description": "Invalid credentials",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Error"
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const specPath = path.join(testDir, 'api-spec.json');
    fs.writeFileSync(specPath, JSON.stringify(testSpec, null, 2), 'utf8');
    
    return this.logResult('OpenAPI specification created', true, `${Object.keys(testSpec.paths).length} paths, ${Object.keys(testSpec.components.schemas).length} schemas`);
  }

  /**
   * Test standalone generator instantiation
   */
  async testStandaloneInstantiation() {
    try {
      // Import the standalone generator
      const { StandaloneMarkdownGenerator } = await import(`${projectRoot}/packages/markdown/standalone-generator.js`);
      
      const generator = new StandaloneMarkdownGenerator(testDir);
      const hasRequiredMethods = [
        'initialize',
        'generate', 
        'cleanup'
      ].every(method => typeof generator[method] === 'function');

      return this.logResult('Standalone generator instantiation', hasRequiredMethods, 
        hasRequiredMethods ? 'All required methods present' : 'Missing required methods');
    } catch (error) {
      return this.logResult('Standalone generator instantiation', false, error.message);
    }
  }

  /**
   * Test CLI availability and basic commands
   */
  testCLIAvailability() {
    try {
      const cliPath = path.join(projectRoot, 'packages/markdown/cli.js');
      
      // Test CLI exists
      if (!fs.existsSync(cliPath)) {
        return this.logResult('CLI availability', false, 'CLI file not found');
      }

      // Test help command
      const helpResult = execSync(`node ${cliPath} --help`, { 
        encoding: 'utf8', 
        cwd: testDir 
      });
      
      const hasRequiredCommands = ['generate', 'validate', 'info'].every(cmd => 
        helpResult.includes(cmd)
      );

      return this.logResult('CLI availability', hasRequiredCommands,
        hasRequiredCommands ? 'All commands available' : 'Missing commands');
    } catch (error) {
      return this.logResult('CLI availability', false, error.message);
    }
  }

  /**
   * Test validation command
   */
  testValidationCommand() {
    try {
      const cliPath = path.join(projectRoot, 'packages/markdown/cli.js');
      const result = execSync(`node ${cliPath} validate --spec api-spec.json`, {
        encoding: 'utf8',
        cwd: testDir
      });

      const validationPassed = result.includes('OpenAPI specification is valid') && 
                               result.includes('Ready for Markdown generation');

      return this.logResult('Validation command', validationPassed,
        validationPassed ? 'Spec validated successfully' : 'Validation failed');
    } catch (error) {
      return this.logResult('Validation command', false, error.message);
    }
  }

  /**
   * Test markdown generation
   */
  async testMarkdownGeneration() {
    try {
      const cliPath = path.join(projectRoot, 'packages/markdown/cli.js');
      const result = execSync(`node ${cliPath} generate --spec api-spec.json --output .`, {
        encoding: 'utf8',
        cwd: testDir
      });

      // Check if generation was successful
      const generationSuccess = result.includes('Markdown generation completed successfully');
      if (!generationSuccess) {
        return this.logResult('Markdown generation', false, 'Generation command failed');
      }

      // Check if output file was created
      const outputPath = path.join(testDir, 'api-docs.md');
      if (!fs.existsSync(outputPath)) {
        return this.logResult('Markdown generation', false, 'Output file not created');
      }

      // Validate output content
      const content = fs.readFileSync(outputPath, 'utf8');
      const hasExpectedContent = [
        '# Standalone Markdown Test API', // Title from spec
        '## Base URLs', // Server information
        '## Quick Reference', // Endpoint links
        '/users', // API paths
        '/auth/login',
        'GET /users', // HTTP methods
        'POST /users',
        '```shell', // Code samples
        'curl -X', // Curl commands
        '## User', // Schema documentation
        'Authorization: Bearer' // Auth documentation
      ].every(expected => content.includes(expected));

      const stats = fs.statSync(outputPath);
      return this.logResult('Markdown generation', hasExpectedContent,
        hasExpectedContent ? `Generated ${stats.size} bytes with all expected content` : 'Missing expected content');

    } catch (error) {
      return this.logResult('Markdown generation', false, error.message);
    }
  }

  /**
   * Test generated markdown content quality
   */
  testGeneratedContentQuality() {
    try {
      const outputPath = path.join(testDir, 'api-docs.md');
      const content = fs.readFileSync(outputPath, 'utf8');
      
      // Quality checks
      const qualityChecks = {
        'Has proper markdown headers': /^#{1,6} /.test(content),
        'Has table formatting': /\|.*\|.*\|/.test(content),
        'Has code blocks': /```/.test(content),
        'Has API endpoints': content.includes('/users') && content.includes('/auth/login'),
        'Has HTTP methods': ['GET', 'POST', 'PUT', 'DELETE'].some(method => content.includes(method)),
        'Has response codes': ['200', '201', '400', '401', '404'].some(code => content.includes(code)),
        'Has curl examples': content.includes('curl -X'),
        'Has schema documentation': content.includes('## User'),
        'Has authentication info': content.includes('Bearer token'),
        'Proper line endings': !content.includes('\r\n'), // Unix line endings
        'No template artifacts': !content.includes('{{') && !content.includes('}}'),
        'Has contact information': content.includes('test@example.com')
      };

      const passedChecks = Object.entries(qualityChecks).filter(([_, passed]) => passed);
      const allPassed = passedChecks.length === Object.keys(qualityChecks).length;

      return this.logResult('Content quality', allPassed, 
        `${passedChecks.length}/${Object.keys(qualityChecks).length} quality checks passed`);

    } catch (error) {
      return this.logResult('Content quality', false, error.message);
    }
  }

  /**
   * Test info command
   */
  testInfoCommand() {
    try {
      const cliPath = path.join(projectRoot, 'packages/markdown/cli.js');
      const result = execSync(`node ${cliPath} info`, {
        encoding: 'utf8',
        cwd: testDir
      });

      const hasExpectedInfo = [
        '@confytome/markdown',
        'Standalone Markdown Generator',
        'OpenAPI 3.x support',
        'Confluence-friendly formatting',
        'confytome-markdown'
      ].every(expected => result.includes(expected));

      return this.logResult('Info command', hasExpectedInfo,
        hasExpectedInfo ? 'All expected info present' : 'Missing expected information');
    } catch (error) {
      return this.logResult('Info command', false, error.message);
    }
  }

  /**
   * Test error handling
   */
  testErrorHandling() {
    try {
      const cliPath = path.join(projectRoot, 'packages/markdown/cli.js');
      
      // Test with missing spec file
      try {
        execSync(`node ${cliPath} generate --spec nonexistent.json`, {
          encoding: 'utf8',
          cwd: testDir
        });
        return this.logResult('Error handling', false, 'Should have failed with missing spec');
      } catch (error) {
        const properErrorHandling = error.stderr?.includes('not found') || 
                                  error.stdout?.includes('not found');
        return this.logResult('Error handling', properErrorHandling,
          properErrorHandling ? 'Proper error messages for missing files' : 'Poor error handling');
      }
    } catch (error) {
      return this.logResult('Error handling', false, error.message);
    }
  }

  /**
   * Test package.json configuration
   */
  testPackageConfiguration() {
    try {
      const packagePath = path.join(projectRoot, 'packages/markdown/package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const configChecks = {
        'Has bin entry': packageJson.bin && packageJson.bin['confytome-markdown'],
        'Has standalone script': packageJson.scripts && packageJson.scripts.standalone,
        'Has required dependencies': packageJson.dependencies && 
                                   packageJson.dependencies.mustache &&
                                   packageJson.dependencies.commander,
        'Has correct files': packageJson.files && 
                           packageJson.files.includes('cli.js') &&
                           packageJson.files.includes('standalone-generator.js'),
        'Is ES module': packageJson.type === 'module'
      };

      const passedChecks = Object.entries(configChecks).filter(([_, passed]) => passed);
      const allPassed = passedChecks.length === Object.keys(configChecks).length;

      return this.logResult('Package configuration', allPassed,
        `${passedChecks.length}/${Object.keys(configChecks).length} configuration checks passed`);
    } catch (error) {
      return this.logResult('Package configuration', false, error.message);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('');
    console.log('📊 Standalone @confytome/markdown Test Results');
    console.log('='.repeat(60));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const duration = (Date.now() - this.startTime) / 1000;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log('');

    if (failedTests > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.testName}: ${r.details}`));
      console.log('');
    }

    const success = failedTests === 0;
    console.log(success ? 
      '🎉 All standalone tests passed! @confytome/markdown is ready for independent use.' : 
      '💥 Some standalone tests failed!'
    );
    
    return success;
  }

  /**
   * Cleanup test environment
   */
  cleanup() {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up test directory: ${testDir}`);
    }
  }

  /**
   * Run all standalone tests
   */
  async runAllTests() {
    console.log('🔬 @confytome/markdown Standalone Test Suite');
    console.log('============================================');
    console.log('');

    try {
      // Setup
      this.setupTestEnvironment();
      this.createTestOpenAPISpec();
      console.log('');

      // Core functionality tests
      await this.testStandaloneInstantiation();
      this.testCLIAvailability();
      this.testValidationCommand();
      await this.testMarkdownGeneration();
      this.testGeneratedContentQuality();
      this.testInfoCommand();
      this.testErrorHandling();
      this.testPackageConfiguration();

      // Generate report
      const success = this.generateReport();
      
      return success;
    } catch (error) {
      console.error('💥 Test suite failed with error:', error);
      return false;
    } finally {
      // Always cleanup
      this.cleanup();
    }
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new StandaloneMarkdownTest();
  
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { StandaloneMarkdownTest };