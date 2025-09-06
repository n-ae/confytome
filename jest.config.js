/**
 * Jest configuration for confytome workspace
 * Unified configuration for all packages supporting ES modules
 */
export default {
  // Enable workspace support
  projects: [
    {
      displayName: '@confytome/core',
      rootDir: './packages/core',
      testEnvironment: 'node',
      transform: {},
      testMatch: [
        '**/test/**/*.test.js',
        '**/__tests__/**/*.js'
      ],
      collectCoverageFrom: [
        'generate-*.js',
        'utils/**/*.js',
        'services/**/*.js',
        'cli.js'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/docs/',
        '/examples/'
      ],
      testTimeout: 30000,
      clearMocks: true
    },
    {
      displayName: '@confytome/generators',
      rootDir: './packages',
      testEnvironment: 'node',
      transform: {},
      testMatch: [
        '**/test/**/*.test.js',
        '**/__tests__/**/*.js'
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/docs/',
        '/examples/',
        '/packages/core/'
      ],
      collectCoverageFrom: [
        'markdown/**/*.js',
        'html/**/*.js',
        'swagger/**/*.js',
        'postman/**/*.js',
        '!**/node_modules/**',
        '!**/test/**',
        '!**/docs/**'
      ],
      testTimeout: 15000,
      clearMocks: true
    }
  ],

  // Global settings
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Ignore patterns for all projects
  testPathIgnorePatterns: [
    '/node_modules/',
    '/docs/',
    '/examples/',
    '/coverage/'
  ],

  // ESM support configuration
  transform: {},
  testEnvironment: 'node'
};
