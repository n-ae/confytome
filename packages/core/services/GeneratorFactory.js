/**
 * Generator Factory
 *
 * Provides a clean interface for creating and managing generators
 * through the generator registry system.
 */

import { generatorRegistry } from './GeneratorRegistry.js';
import { ServiceFactory } from './ServiceFactory.js';
import { getOutputDir } from '../constants.js';

export class GeneratorFactory {
  /**
   * Initialize the factory and discover all available generators
   */
  static async initialize() {
    await generatorRegistry.initialize();
  }

  /**
   * Ensure registry is initialized (used by all public methods)
   * @private
   */
  static async ensureInitialized() {
    if (!generatorRegistry.initialized) {
      await this.initialize();
    }
  }

  /**
   * Create a generator by name
   * @param {string} generatorName - Name of the generator (e.g., 'generate-html')
   * @param {string} outputDir - Output directory for generated files
   * @param {Object} options - Configuration options
   * @returns {Object} Generator instance
   */
  static async createGenerator(generatorName, outputDir, options = {}) {
    outputDir = getOutputDir(outputDir);
    await this.ensureInitialized();

    // Validate generator exists and dependencies are met
    const validation = generatorRegistry.validateGenerator(generatorName);
    if (!validation.valid) {
      throw new Error(`Generator validation failed for ${generatorName}:\\n${validation.errors.join('\\n')}`);
    }

    // Create services if not provided
    let services = options.services;
    if (!services && options.contextUrl) {
      const metadata = generatorRegistry.getMetadata(generatorName);
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

    // Validate the generator instance (required by interface)
    const instanceValidation = await generator.validate(options);
    if (!instanceValidation.valid) {
      throw new Error(`Generator instance validation failed for ${generatorName}:\\n${instanceValidation.errors.join('\\n')}`);
    }

    // Log warnings if any
    if (instanceValidation.warnings && instanceValidation.warnings.length > 0) {
      console.warn(`Generator warnings for ${generatorName}:`);
      instanceValidation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    return generator;
  }

  /**
   * Get all available generators
   * @returns {Array} Array of generator metadata
   */
  static async listGenerators() {
    await this.ensureInitialized();
    return generatorRegistry.listGenerators();
  }

  /**
   * Get generators by type
   * @param {string} type - Generator type (html, markdown, swagger, etc.)
   * @returns {Array} Array of generators of the specified type
   */
  static async getGeneratorsByType(type) {
    await this.ensureInitialized();
    return generatorRegistry.getGeneratorsByType(type);
  }

  /**
   * Get generator metadata
   * @param {string} generatorName - Name of the generator
   * @returns {Object} Generator metadata
   */
  static async getGeneratorInfo(generatorName) {
    await this.ensureInitialized();

    const metadata = generatorRegistry.getMetadata(generatorName);
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
    await this.ensureInitialized();

    const validation = generatorRegistry.validateGenerator(generatorName);
    return validation.valid;
  }

  /**
   * Auto-detect and suggest generators based on available dependencies
   * @returns {Array} Array of recommended generators
   */
  static async getRecommendedGenerators() {
    await this.ensureInitialized();

    const allGenerators = generatorRegistry.listGenerators();

    return allGenerators
      .map(generator => {
        const validation = generatorRegistry.validateGenerator(generator.name);
        return validation.valid || validation.errors.length === 0 ? {
          ...generator,
          reason: validation.valid ? 'All dependencies available' : 'Basic generator, no external dependencies'
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.isExternal !== b.isExternal ? (a.isExternal ? 1 : -1) : a.name.localeCompare(b.name));
  }

  /**
   * Create multiple generators for batch processing
   * @param {Array} generatorNames - Array of generator names
   * @param {string} outputDir - Output directory
   * @param {Object} options - Configuration options
   * @returns {Array} Array of generator instances
   */
  static async createGenerators(generatorNames, outputDir, options = {}) {
    outputDir = getOutputDir(outputDir);
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
  static async executeGenerator(generatorName, outputDir, options = {}) {
    outputDir = getOutputDir(outputDir);
    let generator = null;
    try {
      generator = await this.createGenerator(generatorName, outputDir, options);

      // Initialize the generator (required by interface)
      await generator.initialize(options);

      // Generate output (required by interface)
      const result = await generator.generate(options);

      return {
        success: true,
        generatorName,
        result,
        metadata: generator.getStats?.() || null
      };
    } catch (error) {
      return {
        success: false,
        generatorName,
        error: error.message,
        result: null
      };
    } finally {
      // Cleanup (required by interface)
      if (generator) {
        await generator.cleanup();
      }
    }
  }

  /**
   * Execute multiple generators in sequence
   * @param {Array} generatorNames - Array of generator names
   * @param {string} outputDir - Output directory
   * @param {Object} options - Configuration options
   * @returns {Array} Array of execution results
   */
  static async executeGenerators(generatorNames, outputDir, options = {}) {
    outputDir = getOutputDir(outputDir);
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
   * Validate multiple generators at once
   * @param {Array<string>} generatorNames - Names of generators to validate
   * @returns {Promise<Array<Object>>} Validation results
   */
  static async validateGenerators(generatorNames) {
    await this.ensureInitialized();

    const results = [];
    for (const name of generatorNames) {
      const isAvailable = await this.isGeneratorAvailable(name);
      const info = await this.getGeneratorInfo(name);

      results.push({
        name,
        available: isAvailable,
        validation: info.validation,
        metadata: info.metadata
      });
    }

    return results;
  }

  /**
   * List generators with their status
   * @returns {Promise<Array<Object>>} Generators with status info
   */
  static async listGeneratorsWithStatus() {
    await this.ensureInitialized();

    const allGenerators = await this.listGenerators();
    const results = [];

    for (const generator of allGenerators) {
      const info = await this.getGeneratorInfo(generator.name);
      results.push({
        ...generator,
        available: info.available,
        validation: info.validation
      });
    }

    return results;
  }

  /**
   * Get generators by type (spec-consumer, openapi-generator)
   * @param {string} type - Generator type
   * @returns {Promise<Array<Object>>} Filtered generators
   */
  static async getGeneratorsByGeneratorType(type) {
    await this.ensureInitialized();

    const allGenerators = await this.listGenerators();
    return allGenerators.filter(gen => gen.type === type);
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
