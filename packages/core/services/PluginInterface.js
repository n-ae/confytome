/**
 * Plugin Interface
 * 
 * Defines the interface and utilities for creating external confytome plugins.
 * External plugin developers can use this to create compatible generators.
 */

import { BaseGenerator, SpecConsumerGeneratorBase, OpenAPIGeneratorBase } from '../utils/base-generator.js';

/**
 * Plugin base class for external generators
 * External plugins should extend this class
 */
export class PluginBase {
  constructor(metadata) {
    this.metadata = {
      name: metadata.name,
      type: metadata.type || 'unknown',
      description: metadata.description || 'External generator plugin',
      version: metadata.version || '1.0.0',
      author: metadata.author,
      homepage: metadata.homepage,
      keywords: metadata.keywords || [],
      peerDependencies: metadata.peerDependencies || {},
      ...metadata
    };
    this.generators = [];
  }

  /**
   * Register a generator class with the plugin
   * @param {string} name - Generator name (should match filename pattern)
   * @param {Class} generatorClass - Generator class extending BaseGenerator
   * @param {Object} metadata - Additional metadata for this generator
   */
  registerGenerator(name, generatorClass, metadata = {}) {
    // Validate generator class
    if (!this.isValidGeneratorClass(generatorClass)) {
      throw new Error(`Invalid generator class for ${name}: must extend BaseGenerator and implement required methods`);
    }

    this.generators.push({
      name,
      class: generatorClass,
      metadata: {
        ...this.metadata,
        ...metadata,
        generatorName: name
      }
    });
  }

  /**
   * Validate that a class is a proper generator
   */
  isValidGeneratorClass(cls) {
    if (!cls.prototype) return false;
    
    // Check required methods
    const hasGenerate = typeof cls.prototype.generate === 'function';
    const hasGetSuccessMessage = typeof cls.prototype.getSuccessMessage === 'function';
    
    // Check inheritance from BaseGenerator
    let currentProto = cls.prototype;
    let extendsBaseGenerator = false;
    
    while (currentProto && !extendsBaseGenerator) {
      const constructorName = currentProto.constructor?.name;
      if (constructorName && (
        constructorName === 'BaseGenerator' ||
        constructorName === 'OpenAPIGeneratorBase' ||
        constructorName === 'SpecConsumerGeneratorBase'
      )) {
        extendsBaseGenerator = true;
      }
      currentProto = Object.getPrototypeOf(currentProto);
    }
    
    return hasGenerate && hasGetSuccessMessage && extendsBaseGenerator;
  }

  /**
   * Get all registered generators
   */
  getGenerators() {
    return this.generators;
  }

  /**
   * Get plugin metadata
   */
  getMetadata() {
    return this.metadata;
  }
}

/**
 * Utility functions for plugin developers
 */
export class PluginUtils {
  /**
   * Create a spec consumer generator (for generators that process existing OpenAPI specs)
   * @param {string} name - Generator name
   * @param {string} type - Generator type (html, markdown, etc.)
   * @param {Function} generateFunction - Function that generates content
   * @param {Object} options - Additional options
   * @returns {Class} Generated class extending SpecConsumerGeneratorBase
   */
  static createSpecConsumerGenerator(name, type, generateFunction, options = {}) {
    const className = this.toPascalCase(name) + 'Generator';
    
    class DynamicGenerator extends SpecConsumerGeneratorBase {
      constructor(outputDir = './docs', services = null) {
        super(name, options.description || `${type} documentation generator`, outputDir, services);
        this.generatorType = type;
        this.outputFileName = options.outputFileName || `api-docs.${type === 'html' ? 'html' : type === 'markdown' ? 'md' : 'txt'}`;
      }

      async generate() {
        console.log(`🎨 Generating ${type} documentation...`);
        
        return this.generateDocument(this.generatorType, this.outputFileName, generateFunction);
      }

      getSuccessMessage() {
        return options.successMessage || `${type} documentation generation completed`;
      }
    }

    // Set the class name
    Object.defineProperty(DynamicGenerator, 'name', { value: className });
    
    return DynamicGenerator;
  }

  /**
   * Create an OpenAPI spec generator (for generators that create OpenAPI specs from JSDoc)
   * @param {string} name - Generator name  
   * @param {Function} generateFunction - Function that generates OpenAPI spec
   * @param {Object} options - Additional options
   * @returns {Class} Generated class extending OpenAPIGeneratorBase
   */
  static createOpenAPIGenerator(name, generateFunction, options = {}) {
    const className = this.toPascalCase(name) + 'Generator';
    
    class DynamicGenerator extends OpenAPIGeneratorBase {
      constructor(outputDir = './docs', services = null) {
        super(name, options.description || 'OpenAPI specification generator', outputDir, services);
      }

      async generate(serverConfigPath, jsdocFiles) {
        const services = this.getServices(import.meta.url, 'openapi');
        const config = this.loadServerConfig(serverConfigPath);
        
        return generateFunction(config, jsdocFiles, this.outputDir, services);
      }

      getSuccessMessage() {
        return options.successMessage || 'OpenAPI specification generation completed';
      }
    }

    Object.defineProperty(DynamicGenerator, 'name', { value: className });
    
    return DynamicGenerator;
  }

  /**
   * Convert string to PascalCase
   */
  static toPascalCase(str) {
    return str
      .replace(/[-_]/g, ' ')
      .replace(/(?:^|\\s)\\w/g, (match) => match.toUpperCase())
      .replace(/\\s/g, '');
  }

  /**
   * Validate plugin package structure
   */
  static validatePlugin(plugin) {
    const errors = [];
    
    if (!plugin.metadata) {
      errors.push('Plugin must have metadata');
    } else {
      if (!plugin.metadata.name) errors.push('Plugin metadata must include name');
      if (!plugin.metadata.version) errors.push('Plugin metadata must include version');
      if (!plugin.metadata.type) errors.push('Plugin metadata must include type');
    }

    if (!plugin.generators || !Array.isArray(plugin.generators)) {
      errors.push('Plugin must export generators array');
    } else if (plugin.generators.length === 0) {
      errors.push('Plugin must register at least one generator');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Example plugin template for external developers
 */
export function createExamplePlugin() {
  return `
import { PluginBase, PluginUtils } from 'confytome/plugin-interface';

// Create plugin instance
const plugin = new PluginBase({
  name: 'my-custom-plugin',
  type: 'custom',
  description: 'My custom documentation generator',
  version: '1.0.0',
  author: 'Your Name',
  homepage: 'https://github.com/yourusername/confytome-plugin-custom',
  keywords: ['documentation', 'custom', 'generator'],
  peerDependencies: {
    // List any required peer dependencies
  }
});

// Create a custom generator
const CustomGenerator = PluginUtils.createSpecConsumerGenerator(
  'generate-custom',
  'custom',
  async (openApiSpec, services) => {
    // Your custom generation logic here
    return \`# \${openApiSpec.info.title}\\n\\nCustom documentation content...\`;
  },
  {
    description: 'Generate custom format documentation',
    outputFileName: 'api-docs.custom',
    successMessage: 'Custom documentation generated successfully'
  }
);

// Register the generator
plugin.registerGenerator('generate-custom', CustomGenerator);

// Export the plugin
export default plugin;
export const generators = plugin.getGenerators();
`;
}

// Export base classes for external use
export { BaseGenerator, SpecConsumerGeneratorBase, OpenAPIGeneratorBase };