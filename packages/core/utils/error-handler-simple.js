/**
 * Simple Error Handling Utility
 *
 * Applies KISS principles by eliminating complex error class hierarchies
 * and providing only essential error handling functionality.
 */

import fs from 'fs';
import { OUTPUT_FILES } from '../constants.js';

/**
 * Simple error handler with consistent formatting
 */
export class SimpleErrorHandler {
  constructor(context) {
    this.context = context;
  }

  /**
   * Handle and display errors for this instance
   * @param {Error} error - The error to handle
   * @param {boolean} exit - Whether to exit process (default: true)
   */
  handleError(error, exit = true) {
    SimpleErrorHandler.handle(error, this.context, exit);
  }

  /**
   * Handle and display errors with helpful context
   * @param {Error} error - The error to handle
   * @param {string} context - Context where error occurred (e.g., 'generate-openapi')
   * @param {boolean} exit - Whether to exit process (default: true)
   */
  static handle(error, context, exit = true) {
    console.error(`❌ Error in ${context}:`);
    console.error(`   ${error.message}`);

    // Show additional context for common errors
    if (error.message.includes('ENOENT') && error.message.includes(OUTPUT_FILES.OPENAPI_SPEC)) {
      console.log('💡 Run OpenAPI generator first: confytome openapi -c serverConfig.json -f *.js');
    } else if (error.message.includes('mustache') || error.message.includes('template')) {
      console.log('💡 Check Mustache templates in templates/ directory');
    } else if (error.message.includes('JSON')) {
      console.log('💡 Check JSON syntax in configuration file');
    }

    // Show stack trace in debug mode
    if (process.env.DEBUG) {
      console.error('   Stack:', error.stack);
    }

    if (exit) {
      process.exit(1);
    }
  }

  /**
   * Log success message with optional stats
   * @param {string} context - Operation context
   * @param {string} message - Success message
   * @param {number} startTime - Start timestamp (optional)
   * @param {Object} stats - Statistics object (optional)
   */
  static logSuccess(context, message, startTime = null, stats = {}) {
    console.log(`✅ ${message}`);

    if (Object.keys(stats).length > 0) {
      Object.entries(stats).forEach(([key, value]) => {
        if (value) console.log(`   ${key}: ${value}`);
      });
    }

    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`   Completed in ${duration}ms`);
    }
  }

  /**
   * Validate file exists with helpful error message
   * @param {string} filePath - Path to validate
   * @param {string} context - Context for error message
   * @param {string} suggestion - Optional suggestion text
   */
  static validateFile(filePath, context, suggestion = '') {
    if (!fs.existsSync(filePath)) {
      const error = new Error(`File not found: ${filePath}`);
      if (suggestion) console.log(`💡 ${suggestion}`);
      this.handle(error, context);
    }
  }
}

