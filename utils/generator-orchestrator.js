/**
 * Simplified Generator Orchestrator
 * 
 * Replaces the over-engineered plugin system with direct imports and simple orchestration.
 * This approach prioritizes maintainability and KISS principle over complex abstractions.
 * 
 * Benefits:
 * - No dynamic imports or registry complexity
 * - Clear dependencies visible at import time
 * - Easy to debug and understand
 * - Reduced cognitive load for new developers
 */

import { OpenAPIGenerator } from '../generate-openapi.js';
import { SimpleDocsGenerator } from '../generate-simple-docs.js';
import { SwaggerUIGenerator } from '../generate-swagger-ui.js';
import { MarkdownGenerator } from '../generate-markdown.js';
import { PostmanGenerator } from '../generate-postman.js';

/**
 * Generator definitions with clear dependencies and metadata
 * This replaces the complex registry system with simple, readable configuration
 */
const GENERATORS = {
  openapi: {
    name: 'openapi',
    class: OpenAPIGenerator,
    dependencies: [],
    description: 'Generate OpenAPI 3.0.3 specification from JSDoc comments',
    outputFiles: ['api-spec.json'],
    requiresJSDocFiles: true
  },
  html: {
    name: 'html',
    class: SimpleDocsGenerator,
    dependencies: ['openapi'],
    description: 'Generate professional HTML documentation',
    outputFiles: ['api-docs.html'],
    requiresJSDocFiles: false
  },
  swagger: {
    name: 'swagger',
    class: SwaggerUIGenerator,
    dependencies: ['openapi'],
    description: 'Generate interactive Swagger UI documentation',
    outputFiles: ['api-swagger.html'],
    requiresJSDocFiles: false
  },
  markdown: {
    name: 'markdown',
    class: MarkdownGenerator,
    dependencies: ['openapi'],
    description: 'Generate Confluence-friendly Markdown documentation',
    outputFiles: ['api-docs.md'],
    requiresJSDocFiles: false
  },
  postman: {
    name: 'postman',
    class: PostmanGenerator,
    dependencies: ['openapi'],
    description: 'Generate Postman collection and environment variables',
    outputFiles: ['api-postman.json', 'api-postman-env.json'],
    requiresJSDocFiles: false
  }
};

/**
 * Predefined generator sets for common use cases
 * Much simpler than the previous GeneratorSets system
 */
export const GENERATOR_SETS = {
  ALL: ['openapi', 'html', 'swagger', 'markdown', 'postman'],
  SPEC_CONSUMERS: ['html', 'swagger', 'markdown', 'postman'],
  WEB_DOCS: ['html', 'swagger'],
  TEXT_DOCS: ['markdown']
};

/**
 * Simple dependency resolution using topological sort
 * Simplified version of the previous registry dependency logic
 */
function resolveDependencyOrder(generatorNames) {
  const resolved = [];
  const resolving = new Set();
  const visited = new Set();

  function visit(name) {
    if (visited.has(name)) return;
    if (resolving.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    resolving.add(name);
    
    const generator = GENERATORS[name];
    if (!generator) {
      throw new Error(`Unknown generator: ${name}`);
    }

    // Visit dependencies first
    for (const dep of generator.dependencies) {
      visit(dep);
    }

    resolving.delete(name);
    visited.add(name);
    resolved.push(name);
  }

  for (const name of generatorNames) {
    visit(name);
  }

  return resolved;
}

/**
 * Simplified Generator Orchestrator Class
 * 
 * This replaces the complex GeneratorRegistry with a much simpler approach:
 * - Direct imports instead of dynamic loading
 * - Simple dependency resolution
 * - Clear error messages
 * - Easy to understand and maintain
 */
export class GeneratorOrchestrator {
  /**
   * Run a single generator with configuration
   * @param {string} generatorName - Name of the generator to run
   * @param {Object} config - Configuration object
   * @returns {Promise<Object>} Generation result
   */
  static async runSingle(generatorName, config) {
    const generatorDef = GENERATORS[generatorName];
    if (!generatorDef) {
      throw new Error(`Unknown generator: ${generatorName}. Available: ${Object.keys(GENERATORS).join(', ')}`);
    }

    console.log(`🔄 Running ${generatorDef.description}...`);
    
    try {
      // Create generator with proper output directory
      const generator = new generatorDef.class(config.outputDir);
      
      // For OpenAPI generators, pass the full config; for spec consumers, just run
      const result = generatorDef.requiresJSDocFiles 
        ? await generator.generate(config)
        : await generator.generate();
      
      console.log(`✅ ${generatorDef.description} completed`);
      return result;
    } catch (error) {
      console.error(`❌ ${generatorDef.description} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Run multiple generators in dependency order
   * @param {Array<string>} generatorNames - Names of generators to run
   * @param {Object} config - Configuration object
   * @returns {Promise<Array<Object>>} Array of generation results
   */
  static async runMultiple(generatorNames, config) {
    // Resolve dependency order
    const orderedNames = resolveDependencyOrder(generatorNames);
    
    console.log(`📦 Running ${orderedNames.length} generators: ${orderedNames.join(' → ')}`);
    
    const results = [];
    
    for (const name of orderedNames) {
      try {
        const result = await this.runSingle(name, config);
        results.push({ generator: name, result });
      } catch (error) {
        console.error(`❌ Generator pipeline failed at: ${name}`);
        throw error;
      }
    }
    
    console.log(`🎉 All ${orderedNames.length} generators completed successfully`);
    return results;
  }

  /**
   * Run all generators (convenience method)
   * @param {Object} config - Configuration object
   * @returns {Promise<Array<Object>>} Array of generation results
   */
  static async runAll(config) {
    return this.runMultiple(GENERATOR_SETS.ALL, config);
  }

  /**
   * Get generator information
   * @param {string} generatorName - Name of the generator
   * @returns {Object} Generator metadata
   */
  static getGeneratorInfo(generatorName) {
    const generator = GENERATORS[generatorName];
    if (!generator) {
      throw new Error(`Unknown generator: ${generatorName}`);
    }
    
    return {
      name: generator.name,
      description: generator.description,
      dependencies: generator.dependencies,
      outputFiles: generator.outputFiles,
      requiresJSDocFiles: generator.requiresJSDocFiles
    };
  }

  /**
   * List all available generators
   * @returns {Array<Object>} Array of generator information
   */
  static listGenerators() {
    return Object.keys(GENERATORS).map(name => this.getGeneratorInfo(name));
  }

  /**
   * Validate generator names
   * @param {Array<string>} generatorNames - Names to validate
   * @throws {Error} If any generator name is invalid
   */
  static validateGeneratorNames(generatorNames) {
    const available = Object.keys(GENERATORS);
    const invalid = generatorNames.filter(name => !available.includes(name));
    
    if (invalid.length > 0) {
      throw new Error(`Unknown generators: ${invalid.join(', ')}. Available: ${available.join(', ')}`);
    }
  }
}

export default GeneratorOrchestrator;