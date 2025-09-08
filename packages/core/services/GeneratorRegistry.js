/**
 * Modern Generator Registry with Interface-Based Plugin Discovery
 *
 * Uses standard generator interfaces instead of manifest files.
 * Generators implement IGenerator interface for automatic discovery.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { getOutputDir } from '../constants.js';
import { GeneratorValidator } from '../interfaces/IGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GeneratorRegistry {
  constructor() {
    this.generators = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry by discovering interface-compliant generators
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('🔌 Discovering generators via interface introspection...');

    // Discover workspace generators via interface discovery
    await this.discoverWorkspaceGenerators();

    this.initialized = true;
    console.log(`✅ Discovered ${this.generators.size} generators`);
  }

  /**
   * Discover generators in workspace packages by loading generator files
   */
  async discoverWorkspaceGenerators() {
    try {
      const packagesRoot = path.resolve(__dirname, '../../../');
      const generatorFiles = await glob('packages/*/generate-*.js', { cwd: packagesRoot });

      console.log(`   Found ${generatorFiles.length} generator files`);

      for (const generatorFile of generatorFiles) {
        const generatorPath = path.join(packagesRoot, generatorFile);
        await this.loadGeneratorFromFile(generatorPath);
      }
    } catch (error) {
      console.warn('Warning: Could not discover workspace generators:', error.message);
    }
  }

  /**
   * Discover external generator plugins (placeholder for future expansion)
   */
  async discoverExternalPlugins() {
    // Future: Scan node_modules for packages with generate-*.js files that implement IGenerator
    // This would allow third-party plugins while maintaining interface compliance
  }

  /**
   * Load a generator from its file using interface introspection
   */
  async loadGeneratorFromFile(generatorPath) {
    try {
      if (!fs.existsSync(generatorPath)) {
        console.warn(`Generator file not found: ${generatorPath}`);
        return;
      }

      // Load the generator module
      const fileUrl = `file://${generatorPath}`;
      const module = await import(fileUrl);

      // Find generator class (look for default export or named exports)
      const GeneratorClass = this.findGeneratorClass(module);

      if (!GeneratorClass) {
        console.warn(`No generator class found in ${generatorPath}`);
        return;
      }

      // Validate that the class implements IGenerator interface
      const validation = GeneratorValidator.validateInterface(GeneratorClass);
      if (!validation.valid) {
        console.warn(`Generator class in ${generatorPath} does not implement IGenerator interface:`);
        validation.errors.forEach(error => console.warn(`  - ${error}`));
        return;
      }

      // Get metadata from the class
      const metadata = GeneratorClass.getMetadata();

      // Register the generator
      this.registerGenerator(metadata.name, {
        class: GeneratorClass,
        metadata,
        module,
        filePath: generatorPath
      });

      console.log(`   ✓ Loaded ${metadata.name} generator`);

      // Log warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => console.warn(`   ⚠️  ${warning}`));
      }

    } catch (error) {
      console.warn(`Failed to load generator from ${generatorPath}:`, error.message);
    }
  }

  /**
   * Find generator class in a module (interface-based discovery)
   */
  findGeneratorClass(module) {
    // Check for default export first
    if (module.default && typeof module.default === 'function' && module.default.getMetadata) {
      return module.default;
    }

    // Look through named exports for classes with getMetadata static method
    const exports = Object.values(module);
    for (const exportValue of exports) {
      if (typeof exportValue === 'function' && exportValue.getMetadata) {
        return exportValue;
      }
    }

    return null;
  }


  /**
   * Register a generator in the registry
   */
  registerGenerator(name, generatorInfo) {
    this.generators.set(name, generatorInfo);
  }

  /**
   * Get a generator by name
   */
  getGenerator(name) {
    return this.generators.get(name);
  }

  /**
   * Get all available generators
   */
  getAllGenerators() {
    return Array.from(this.generators.keys());
  }

  /**
   * Get generators by type
   */
  getGeneratorsByType(type) {
    return Array.from(this.generators.values())
      .filter(info => info.metadata.type === type)
      .map(info => info.metadata.name);
  }

  /**
   * Get generator metadata
   */
  getMetadata(name) {
    const generatorInfo = this.generators.get(name);
    return generatorInfo?.metadata;
  }

  /**
   * Create a generator instance
   */
  createGenerator(name, outputDir, services = null) {
    outputDir = getOutputDir(outputDir);
    const generatorInfo = this.generators.get(name);
    if (!generatorInfo) {
      throw new Error(`Generator '${name}' not found`);
    }

    try {
      return new generatorInfo.class(outputDir, services);
    } catch (error) {
      throw new Error(`Failed to create generator '${name}': ${error.message}`);
    }
  }

  /**
   * Check if generator exists
   */
  hasGenerator(name) {
    return this.generators.has(name);
  }

  /**
   * List all generators with their metadata
   */
  listGenerators() {
    return Array.from(this.generators.values()).map(info => ({
      ...info.metadata,
      filePath: info.filePath
    }));
  }


  /**
   * Validate generator availability (simplified validation)
   */
  validateGenerator(name) {
    const generator = this.generators.get(name);

    if (!generator) {
      return {
        valid: false,
        errors: [`Generator '${name}' not found`]
      };
    }

    // Basic validation - generator exists and can be instantiated
    const errors = [];
    const warnings = [];

    // Check if generator file exists
    if (!fs.existsSync(generator.filePath)) {
      errors.push(`Generator file not found: ${generator.filePath}`);
    }

    // Validate generator interface compliance
    const validation = GeneratorValidator.validateInterface(generator.class);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const generatorRegistry = new GeneratorRegistry();
