/**
 * confytome Constants
 *
 * Single source of truth for configuration constants across the application.
 * This ensures consistency and makes it easy to change default values.
 */

/**
 * Default output directory - single source of truth
 */
export const DEFAULT_OUTPUT_DIR = './confytome';

/**
 * Get output directory with injectable default
 * @param {string} [outputDir] - Override output directory
 * @returns {string} The output directory to use
 */
export function getOutputDir(outputDir) {
  return outputDir || DEFAULT_OUTPUT_DIR;
}


/**
 * Default configuration file names
 * @type {Object}
 */
export const DEFAULT_CONFIG_FILES = {
  CONFYTOME: './confytome.json',
  SERVER: './serverConfig.json'
};

/**
 * Generated file names
 * @type {Object}
 */
export const OUTPUT_FILES = {
  OPENAPI_SPEC: 'api-spec.json',
  HTML_DOCS: 'api-docs.html',
  MARKDOWN_DOCS: 'api-docs.md',
  SWAGGER_UI: 'api-swagger.html',
  POSTMAN_COLLECTION: 'postman-collection.json',
  POSTMAN_ENVIRONMENT: 'postman-env.json'
};

/**
 * Template directory names
 * @type {Object}
 */
export const TEMPLATE_DIRS = {
  WIDDERSHINS: 'widdershins-templates'
};

/**
 * Environment configuration
 * @type {Object}
 */
export const ENV = {
  NODE_MIN_VERSION: '18.0.0'
};

/**
 * Package metadata
 * @type {Object}
 */
export const PACKAGE_INFO = {
  NAMESPACE: '@confytome',
  PLUGIN_PREFIX: 'confytome-plugin-',
  MANIFEST_FILE: 'confytome-plugin.json'
};

