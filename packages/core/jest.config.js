/**
 * Jest configuration for ES modules
 * @type {import('jest').Config}
 */
export default {
  // Use Node's experimental ESM loader
  testEnvironment: 'node',
  
  // Transform files with ESM (empty to use native ES modules)
  transform: {},
  
  // Test match patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'generate-*.js',
    'utils/**/*.js',
    'bin.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/docs/',
    '/examples/'
  ],
  
  // Timeout for async tests (CLI commands can be slow)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true
};
