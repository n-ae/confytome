/**
 * Registry-based Generator Orchestrator
 *
 * Replaces the simplified generator orchestrator with a plugin-aware system
 * that uses the GeneratorRegistry for dynamic discovery and execution.
 */

import { GeneratorFactory } from './GeneratorFactory.js';
import { generatorRegistry } from './GeneratorRegistry.js';

export class RegistryOrchestrator {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the orchestrator and discover all generators
   */
  async initialize() {
    if (this.initialized) return;

    await GeneratorFactory.initialize();
    this.initialized = true;
  }

  /**
   * Get all available generators with their metadata
   */
  async getAvailableGenerators() {
    await this.initialize();
    return await GeneratorFactory.listGenerators();
  }

  /**
   * Get generators that don't require JSDoc files (spec consumers)
   */
  async getSpecConsumerGenerators() {
    await this.initialize();
    const allGenerators = await GeneratorFactory.listGenerators();
    return allGenerators.filter(gen => {
      const metadata = generatorRegistry.getGeneratorMetadata(gen.name);
      return metadata && !metadata.requiresJSDocFiles;
    });
  }

  /**
   * Get generators that require JSDoc files (spec creators)
   */
  async getSpecCreatorGenerators() {
    await this.initialize();
    const allGenerators = await GeneratorFactory.listGenerators();
    return allGenerators.filter(gen => {
      const metadata = generatorRegistry.getGeneratorMetadata(gen.name);
      return metadata && metadata.requiresJSDocFiles;
    });
  }

  /**
   * Execute a single generator
   */
  async executeGenerator(generatorName, outputDir = './docs', options = {}) {
    await this.initialize();
    return await GeneratorFactory.executeGenerator(generatorName, outputDir, options);
  }

  /**
   * Execute multiple generators in dependency order
   */
  async executeGenerators(generatorNames, outputDir = './docs', options = {}) {
    await this.initialize();

    // Resolve execution order based on dependencies
    const executionOrder = this.resolveDependencyOrder(generatorNames);

    return await GeneratorFactory.executeGenerators(executionOrder, outputDir, options);
  }

  /**
   * Execute all available spec consumer generators (html, markdown, swagger, etc.)
   */
  async executeAllSpecConsumers(outputDir = './docs', options = {}) {
    const specConsumers = await this.getSpecConsumerGenerators();
    const generatorNames = specConsumers.map(gen => gen.name);

    return await this.executeGenerators(generatorNames, outputDir, options);
  }

  /**
   * Execute a predefined set of generators
   */
  async executeGeneratorSet(setName, outputDir = './docs', options = {}) {
    const sets = await this.getGeneratorSets();
    const generatorNames = sets[setName];

    if (!generatorNames) {
      throw new Error(`Unknown generator set: ${setName}`);
    }

    return await this.executeGenerators(generatorNames, outputDir, options);
  }

  /**
   * Get predefined generator sets
   */
  async getGeneratorSets() {
    await this.initialize();

    const allGenerators = await GeneratorFactory.listGenerators();
    const specConsumers = await this.getSpecConsumerGenerators();
    const specCreators = await this.getSpecCreatorGenerators();

    return {
      ALL: allGenerators.map(gen => gen.name),
      SPEC_CONSUMERS: specConsumers.map(gen => gen.name),
      SPEC_CREATORS: specCreators.map(gen => gen.name),
      HTML: allGenerators.filter(gen => gen.type === 'html').map(gen => gen.name),
      MARKDOWN: allGenerators.filter(gen => gen.type === 'markdown').map(gen => gen.name),
      SWAGGER: allGenerators.filter(gen => gen.type === 'swagger').map(gen => gen.name),
      RECOMMENDED: (await GeneratorFactory.getRecommendedGenerators()).map(gen => gen.name)
    };
  }

  /**
   * Resolve dependency order for generators
   * OpenAPI spec generators should run before spec consumers
   */
  resolveDependencyOrder(generatorNames) {
    const specCreators = [];
    const specConsumers = [];
    const others = [];

    for (const name of generatorNames) {
      const metadata = generatorRegistry.getGeneratorMetadata(name);
      if (!metadata) {
        others.push(name);
        continue;
      }

      if (metadata.requiresJSDocFiles) {
        specCreators.push(name);
      } else {
        specConsumers.push(name);
      }
    }

    // Return in dependency order: spec creators first, then consumers, then others
    return [...specCreators, ...specConsumers, ...others];
  }

  /**
   * Validate that all requested generators are available
   */
  async validateGenerators(generatorNames) {
    await this.initialize();

    const results = [];

    for (const name of generatorNames) {
      const isAvailable = await GeneratorFactory.isGeneratorAvailable(name);
      const info = await GeneratorFactory.getGeneratorInfo(name);

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
   * Get detailed information about a generator
   */
  async getGeneratorInfo(generatorName) {
    await this.initialize();
    return await GeneratorFactory.getGeneratorInfo(generatorName);
  }

  /**
   * List all generators with their status and compatibility
   */
  async listGeneratorsWithStatus() {
    await this.initialize();

    const allGenerators = await GeneratorFactory.listGenerators();
    const results = [];

    for (const generator of allGenerators) {
      const info = await GeneratorFactory.getGeneratorInfo(generator.name);
      results.push({
        ...generator,
        available: info.validation.valid,
        errors: info.validation.errors,
        compatible: info.validation.errors.length === 0
      });
    }

    return results;
  }

  /**
   * Check if the orchestrator has been initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
export const registryOrchestrator = new RegistryOrchestrator();
