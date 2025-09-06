/**
 * Generator Factory
 *
 * Provides a clean interface for creating and managing generators
 * through the generator registry system.
 */

import { generatorRegistry } from './GeneratorRegistry.js';
import { ServiceFactory } from './ServiceFactory.js';

export class GeneratorFactory {
  /**
   * Initialize the factory and discover all available generators
   */
  static async initialize() {
    await generatorRegistry.initialize();
  }

  /**
   * Create a generator by name
   * @param {string} generatorName - Name of the generator (e.g., 'generate-html')
   * @param {string} outputDir - Output directory for generated files
   * @param {Object} options - Configuration options
   * @returns {Object} Generator instance
   */
  static async createGenerator(generatorName, outputDir = './docs', options = {}) {
    // Ensure registry is initialized
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }

    // Validate generator exists and dependencies are met
    const validation = generatorRegistry.validateGenerator(generatorName);
    if (!validation.valid) {
      throw new Error(`Generator validation failed for ${generatorName}:\\n${validation.errors.join('\\n')}`);
    }

    // Create services if not provided
    let services = options.services;
    if (!services && options.contextUrl) {
      const metadata = generatorRegistry.getGeneratorMetadata(generatorName);
      services = ServiceFactory.createGeneratorServices(
        options.contextUrl,
        metadata.type,
        options
      );
    }

    // Create generator instance
    const generator = generatorRegistry.createGenerator(generatorName, outputDir, services);

    // Apply any additional configuration
    if (options.excludeBrand !== undefined) {
      generator.excludeBrand = options.excludeBrand;
    }

    return generator;
  }

  /**
   * Get all available generators
   * @returns {Array} Array of generator metadata
   */
  static async listGenerators() {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }
    return generatorRegistry.listGenerators();
  }

  /**
   * Get generators by type
   * @param {string} type - Generator type (html, markdown, swagger, etc.)
   * @returns {Array} Array of generators of the specified type
   */
  static async getGeneratorsByType(type) {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }
    return generatorRegistry.getGeneratorsByType(type);
  }

  /**
   * Get generator metadata
   * @param {string} generatorName - Name of the generator
   * @returns {Object} Generator metadata
   */
  static async getGeneratorInfo(generatorName) {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }

    const metadata = generatorRegistry.getGeneratorMetadata(generatorName);
    const validation = generatorRegistry.validateGenerator(generatorName);

    return {
      metadata,
      validation,
      available: validation.valid
    };
  }

  /**
   * Check if a generator is available
   * @param {string} generatorName - Name of the generator
   * @returns {boolean} True if generator is available and valid
   */
  static async isGeneratorAvailable(generatorName) {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }

    const validation = generatorRegistry.validateGenerator(generatorName);
    return validation.valid;
  }

  /**
   * Auto-detect and suggest generators based on available dependencies
   * @returns {Array} Array of recommended generators
   */
  static async getRecommendedGenerators() {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }

    const allGenerators = generatorRegistry.listGenerators();
    const recommended = [];

    for (const generator of allGenerators) {
      const validation = generatorRegistry.validateGenerator(generator.name);
      if (validation.valid) {
        recommended.push({
          ...generator,
          reason: 'All dependencies available'
        });
      } else if (validation.errors.length === 0) {
        recommended.push({
          ...generator,
          reason: 'Basic generator, no external dependencies'
        });
      }
    }

    return recommended.sort((a, b) => {
      // Prioritize workspace generators over external plugins
      if (a.isExternal !== b.isExternal) {
        return a.isExternal ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Create multiple generators for batch processing
   * @param {Array} generatorNames - Array of generator names
   * @param {string} outputDir - Output directory
   * @param {Object} options - Configuration options
   * @returns {Array} Array of generator instances
   */
  static async createGenerators(generatorNames, outputDir = './docs', options = {}) {
    const generators = [];

    for (const name of generatorNames) {
      try {
        const generator = await this.createGenerator(name, outputDir, options);
        generators.push({
          name,
          generator,
          success: true
        });
      } catch (error) {
        generators.push({
          name,
          generator: null,
          success: false,
          error: error.message
        });
      }
    }

    return generators;
  }

  /**
   * Execute a generator with error handling
   * @param {string} generatorName - Name of the generator
   * @param {string} outputDir - Output directory
   * @param {Object} options - Configuration options
   * @returns {Object} Execution result
   */
  static async executeGenerator(generatorName, outputDir = './docs', options = {}) {
    try {
      const generator = await this.createGenerator(generatorName, outputDir, options);
      const result = await generator.run();

      return {
        success: true,
        generatorName,
        result,
        metadata: generator.getStats ? generator.getStats() : null
      };
    } catch (error) {
      return {
        success: false,
        generatorName,
        error: error.message,
        result: null
      };
    }
  }

  /**
   * Execute multiple generators in sequence
   * @param {Array} generatorNames - Array of generator names
   * @param {string} outputDir - Output directory
   * @param {Object} options - Configuration options
   * @returns {Array} Array of execution results
   */
  static async executeGenerators(generatorNames, outputDir = './docs', options = {}) {
    const results = [];

    for (const name of generatorNames) {
      const result = await this.executeGenerator(name, outputDir, options);
      results.push(result);

      // Stop on first failure if failFast option is enabled
      if (!result.success && options.failFast) {
        break;
      }
    }

    return results;
  }

  /**
   * Get generator registry instance (for advanced use cases)
   * @returns {GeneratorRegistry} Registry instance
   */
  static getRegistry() {
    return generatorRegistry;
  }
}

export default GeneratorFactory;
