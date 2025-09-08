/**
 * IGenerator Interface
 *
 * Defines the standard contract that all confytome generators must implement.
 * This interface replaces manifest file-based discovery with runtime introspection.
 */

/**
 * Generator Types
 */
export const GeneratorTypes = {
  OPENAPI_GENERATOR: 'openapi-generator',    // Creates OpenAPI specs from JSDoc
  SPEC_CONSUMER: 'spec-consumer'             // Consumes existing OpenAPI specs
};

/**
 * Metadata Factory - eliminates redundant getMetadata implementations
 */
export class MetadataFactory {
  /**
   * Create standardized metadata for spec-consumer generators
   * @param {string} name - Generator name
   * @param {string} description - Generator description
   * @param {string} className - Generator class name
   * @param {string[]} outputs - Output files
   * @returns {Object} Generator metadata
   */
  static createSpecConsumerMetadata(name, description, className, outputs) {
    return {
      name,
      type: GeneratorTypes.SPEC_CONSUMER,
      description,
      className,
      outputs: Array.isArray(outputs) ? outputs : [outputs],
      standalone: true
    };
  }

  /**
   * Create standardized metadata for OpenAPI generator
   * @param {string} name - Generator name
   * @param {string} description - Generator description
   * @param {string} className - Generator class name
   * @param {string[]} outputs - Output files
   * @returns {Object} Generator metadata
   */
  static createOpenAPIGeneratorMetadata(name, description, className, outputs) {
    return {
      name,
      type: GeneratorTypes.OPENAPI_GENERATOR,
      description,
      className,
      outputs: Array.isArray(outputs) ? outputs : [outputs],
      standalone: true
    };
  }
}

/**
 * Generator metadata structure
 * @typedef {Object} GeneratorMetadata
 * @property {string} name - Generator name (used for registration)
 * @property {string} type - Generator type (from GeneratorTypes)
 * @property {string} description - Human readable description
 * @property {string} className - Class name for instantiation
 * @property {string[]} outputs - List of output file names/patterns
 * @property {boolean} standalone - Can run independently
 */

/**
 * Generator Interface
 *
 * All generators must implement this interface to be discoverable
 * and manageable by the GeneratorRegistry system.
 */
export class IGenerator {
  /**
   * Get generator metadata
   * This is a static method that provides generator information
   * without requiring instantiation.
   *
   * @returns {GeneratorMetadata} Generator metadata
   */
  static getMetadata() {
    throw new Error('Generator must implement static getMetadata() method');
  }

  /**
   * Validate that this generator can run in the current environment
   * Checks dependencies, required files, and configuration.
   *
   * @param {Object} options - Validation options
   * @returns {Promise<{valid: boolean, errors: string[], warnings: string[]}>}
   */
  async validate(_options = {}) {
    throw new Error('Generator must implement validate() method');
  }

  /**
   * Initialize the generator
   * Setup any required resources, validate configuration, etc.
   *
   * @param {Object} options - Initialization options
   * @returns {Promise<void>}
   */
  async initialize(_options = {}) {
    throw new Error('Generator must implement initialize() method');
  }

  /**
   * Generate the output
   * Main generation logic - this is where the work happens.
   *
   * @param {Object} options - Generation options
   * @returns {Promise<{success: boolean, outputs: string[], stats: Object}>}
   */
  async generate(_options = {}) {
    throw new Error('Generator must implement generate() method');
  }

  /**
   * Clean up resources
   * Called after generation to clean up temporary files, connections, etc.
   *
   * @returns {Promise<void>}
   */
  async cleanup() {
    // Default implementation - generators can override if needed
  }


}

/**
 * Generator Interface Validator
 *
 * Utility class to validate that a class properly implements IGenerator
 */
export class GeneratorValidator {
  /**
   * Validate that a class implements the IGenerator interface
   *
   * @param {Function} GeneratorClass - Class to validate
   * @returns {{valid: boolean, errors: string[], warnings: string[]}}
   */
  static validateInterface(GeneratorClass) {
    const errors = [];
    const warnings = [];

    // Check if it's a class
    if (typeof GeneratorClass !== 'function') {
      errors.push('Generator must be a class/function');
      return { valid: false, errors, warnings };
    }

    // Check static getMetadata method
    if (typeof GeneratorClass.getMetadata !== 'function') {
      errors.push('Generator must implement static getMetadata() method');
    } else {
      try {
        const metadata = GeneratorClass.getMetadata();
        this.validateMetadata(metadata, errors, warnings);
      } catch (error) {
        errors.push(`getMetadata() method error: ${error.message}`);
      }
    }

    // Check instance methods (by examining prototype)
    const requiredMethods = ['validate', 'initialize', 'generate'];
    const prototype = GeneratorClass.prototype;

    requiredMethods.forEach(method => {
      if (typeof prototype[method] !== 'function') {
        errors.push(`Generator must implement ${method}() method`);
      }
    });

    // All required methods are checked above - no optional methods for interface compliance

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate generator metadata structure
   *
   * @param {Object} metadata - Metadata to validate
   * @param {string[]} errors - Error array to populate
   * @param {string[]} warnings - Warning array to populate
   */
  static validateMetadata(metadata, errors, _warnings) {
    const required = ['name', 'type', 'description', 'className'];

    required.forEach(field => {
      if (!metadata[field] || typeof metadata[field] !== 'string') {
        errors.push(`Metadata must include '${field}' as a string`);
      }
    });

    if (metadata.type && !Object.values(GeneratorTypes).includes(metadata.type)) {
      errors.push(`Invalid generator type: ${metadata.type}`);
    }
  }
}

export default IGenerator;
