/**
 * Test Helper Utilities
 *
 * Provides common utilities for setting up test environments
 * and running CLI commands in isolated directories
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);
const binPath = path.join(projectRoot, 'cli.js');

export class TestEnvironment {
  constructor(testName = 'confytome-test') {
    this.testDir = path.join(os.tmpdir(), `${testName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    this.originalCwd = process.cwd();
  }

  /**
   * Set up a clean test directory
   */
  setup() {
    fs.mkdirSync(this.testDir, { recursive: true });
    process.chdir(this.testDir);
    return this.testDir;
  }

  /**
   * Clean up test directory and restore original working directory
   */
  cleanup() {
    process.chdir(this.originalCwd);
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
  }

  /**
   * Run a confytome CLI command
   * @param {string} command - The command to run (e.g., 'init', 'openapi -c config.json -f router.js')
   * @param {object} options - Options for execSync
   * @returns {object} - { stdout, stderr, success }
   */
  runConfytome(command, options = {}) {
    const fullCommand = `node "${binPath}" ${command}`;

    try {
      const result = execSync(fullCommand, {
        cwd: this.testDir,
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });

      return {
        stdout: result,
        stderr: '',
        success: true
      };
    } catch (error) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        success: false,
        error
      };
    }
  }

  /**
   * Create a test file in the test directory
   * @param {string} filename - Name of the file
   * @param {string} content - File content
   */
  createFile(filename, content) {
    const filePath = path.join(this.testDir, filename);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  /**
   * Check if a file exists in the test directory
   * @param {string} filename - Name of the file to check
   * @returns {boolean}
   */
  fileExists(filename) {
    return fs.existsSync(path.join(this.testDir, filename));
  }

  /**
   * Read a file from the test directory
   * @param {string} filename - Name of the file to read
   * @returns {string} - File content
   */
  readFile(filename) {
    const filePath = path.join(this.testDir, filename);
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Get the size of a file in bytes
   * @param {string} filename - Name of the file
   * @returns {number} - File size in bytes
   */
  getFileSize(filename) {
    const filePath = path.join(this.testDir, filename);
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  /**
   * List files in a directory within the test environment
   * @param {string} dir - Directory to list (relative to test dir)
   * @returns {string[]} - Array of file names
   */
  listFiles(dir = '.') {
    const fullPath = path.join(this.testDir, dir);
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    return fs.readdirSync(fullPath);
  }

  /**
   * Get the test directory path
   * @returns {string}
   */
  getTestDir() {
    return this.testDir;
  }
}

/**
 * Sample server config for testing
 */
export const SAMPLE_SERVER_CONFIG = {
  'openapi': '3.0.3',
  'info': {
    'title': 'Test API',
    'version': '1.0.0',
    'description': 'Test API for Jest testing'
  },
  'servers': [
    {
      'url': 'https://api.test.com/v1',
      'description': 'Test Server'
    }
  ],
  'security': [
    {
      'bearerAuth': []
    }
  ],
  'components': {
    'securitySchemes': {
      'bearerAuth': {
        'type': 'http',
        'scheme': 'bearer',
        'bearerFormat': 'JWT'
      }
    }
  }
};

/**
 * Sample router with JSDoc comments for testing
 */
export const SAMPLE_ROUTER_JS = `/**
 * @swagger
 * components:
 *   schemas:
 *     TestUser:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 123
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@test.com"
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestUser'
 *       500:
 *         description: Server error
 */
function getAllUsers(req, res) {
  // Implementation here
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: User ID
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestUser'
 *       404:
 *         description: User not found
 */
function getUserById(req, res) {
  // Implementation here
}

module.exports = {
  getAllUsers,
  getUserById
};`;

/**
 * Validate that a string is valid JSON
 * @param {string} str - String to validate
 * @returns {boolean}
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that an object conforms to basic OpenAPI 3.0 structure
 * @param {object} spec - OpenAPI spec object
 * @returns {boolean}
 */
export function isValidOpenAPISpec(spec) {
  if (!spec || typeof spec !== 'object') return false;

  // Check required fields
  if (!spec.openapi || !spec.info || !spec.paths) return false;

  // Check openapi version
  if (!spec.openapi.startsWith('3.')) return false;

  // Check info object
  if (!spec.info.title || !spec.info.version) return false;

  // Check paths is an object
  if (typeof spec.paths !== 'object') return false;

  return true;
}

export default {
  TestEnvironment,
  SAMPLE_SERVER_CONFIG,
  SAMPLE_ROUTER_JS,
  isValidJSON,
  isValidOpenAPISpec
};
