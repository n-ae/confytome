/**
 * Generator Registry and Plugin System
 * 
 * Provides a centralized registry for all generators with plugin discovery,
 * dynamic loading, and compatibility validation.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

export class GeneratorRegistry {
  constructor() {
    this.generators = new Map();
    this.pluginMetadata = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry by discovering all available generators
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('🔌 Initializing generator plugin system...');
    
    // Discover workspace generators
    await this.discoverWorkspaceGenerators();
    
    // Discover external plugins
    await this.discoverExternalPlugins();
    
    this.initialized = true;
    console.log(`✅ Generator registry initialized with ${this.generators.size} generators`);
  }

  /**
   * Discover generators in the current workspace
   */
  async discoverWorkspaceGenerators() {
    try {
      // Find all packages in the workspace
      const packagesRoot = path.resolve(__dirname, '../../../');
      const packageDirs = await glob('packages/*', { cwd: packagesRoot });
      
      for (const packageDir of packageDirs) {
        const packagePath = path.join(packagesRoot, packageDir);
        await this.scanPackageForGenerators(packagePath);
      }
    } catch (error) {
      console.warn('Warning: Could not discover workspace generators:', error.message);
    }
  }

  /**
   * Discover external generator plugins via npm
   */
  async discoverExternalPlugins() {
    try {
      const packageJsonPath = this.findRootPackageJson();
      if (!packageJsonPath) {
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Look for packages that follow the confytome-plugin-* naming convention
      for (const [packageName, version] of Object.entries(dependencies)) {
        if (packageName.startsWith('confytome-plugin-') || 
            packageName.startsWith('@confytome/plugin-')) {
          await this.loadExternalPlugin(packageName, version);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not discover external plugins:', error.message);
    }
  }

  /**
   * Scan a package directory for generator files
   */
  async scanPackageForGenerators(packagePath) {
    try {
      const packageJsonPath = path.join(packagePath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Skip core package as it doesn't contain generators
      if (packageJson.name === '@confytome/core') {
        return;
      }

      // Look for generator files
      const generatorFiles = await glob('generate-*.js', { cwd: packagePath });
      
      for (const generatorFile of generatorFiles) {
        const generatorPath = path.join(packagePath, generatorFile);
        await this.loadGeneratorFromFile(generatorPath, packageJson);
      }
    } catch (error) {
      console.warn(`Warning: Could not scan package ${packagePath}:`, error.message);
    }
  }

  /**
   * Load a generator from a file and register it
   */
  async loadGeneratorFromFile(filePath, packageJson) {
    try {
      // Convert to file URL for ES module import
      const fileUrl = `file://${filePath}`;
      const module = await import(fileUrl);
      
      // Find the generator class in the module
      const generatorClass = this.findGeneratorClass(module);
      if (!generatorClass) {
        return;
      }

      // Extract metadata from the generator
      const metadata = this.extractGeneratorMetadata(generatorClass, filePath, packageJson);
      
      // Register the generator
      this.registerGenerator(metadata.name, {
        class: generatorClass,
        metadata,
        module,
        filePath
      });

    } catch (error) {
      console.warn(`Warning: Could not load generator from ${filePath}:`, error.message);
    }
  }

  /**
   * Find the main generator class in a module
   */
  findGeneratorClass(module) {
    // Look for exported generator classes
    const potentialClasses = Object.values(module).filter(
      exported => typeof exported === 'function' && 
      exported.prototype && 
      this.isGeneratorClass(exported)
    );

    // Return the first valid generator class
    return potentialClasses[0] || null;
  }

  /**
   * Check if a class is a valid generator class
   */
  isGeneratorClass(cls) {
    if (!cls.prototype) return false;
    
    // Check if it has the required methods
    const hasGenerateMethod = typeof cls.prototype.generate === 'function';
    const hasGetSuccessMessage = typeof cls.prototype.getSuccessMessage === 'function';
    
    // Check if it extends BaseGenerator or its subclasses
    let currentProto = cls.prototype;
    while (currentProto) {
      const constructorName = currentProto.constructor?.name;
      if (constructorName && (
        constructorName.includes('Generator') ||
        constructorName === 'BaseGenerator' ||
        constructorName === 'OpenAPIGeneratorBase' ||
        constructorName === 'SpecConsumerGeneratorBase'
      )) {
        return hasGenerateMethod;
      }
      currentProto = Object.getPrototypeOf(currentProto);
    }
    
    return false;
  }

  /**
   * Extract metadata from a generator class
   */
  extractGeneratorMetadata(generatorClass, filePath, packageJson) {
    const className = generatorClass.name;
    const filename = path.basename(filePath, '.js');
    
    // Determine generator type from filename or class name
    let type = 'unknown';
    if (filename.includes('html') || className.toLowerCase().includes('html')) {
      type = 'html';
    } else if (filename.includes('markdown') || className.toLowerCase().includes('markdown')) {
      type = 'markdown';
    } else if (filename.includes('swagger') || className.toLowerCase().includes('swagger')) {
      type = 'swagger';
    } else if (filename.includes('openapi') || className.toLowerCase().includes('openapi')) {
      type = 'openapi';
    } else if (filename.includes('postman') || className.toLowerCase().includes('postman')) {
      type = 'postman';
    }

    // Create a temporary instance to get metadata
    let description = `${type} generator`;
    let requiresJSDocFiles = false;
    
    try {
      // Try to create instance to get metadata (with minimal parameters)
      const tempInstance = new generatorClass('./temp');
      description = tempInstance.description || description;
      requiresJSDocFiles = tempInstance.requiresJSDocFiles || false;
    } catch (error) {
      // Fallback if instantiation fails
      console.debug(`Could not instantiate ${className} for metadata extraction:`, error.message);
    }

    return {
      name: filename,
      className,
      type,
      description,
      version: packageJson.version,
      packageName: packageJson.name,
      requiresJSDocFiles,
      dependencies: packageJson.dependencies || {},
      peerDependencies: packageJson.peerDependencies || {},
      filePath,
      isWorkspaceGenerator: true,
      isExternalPlugin: false
    };
  }

  /**
   * Load an external plugin package
   */
  async loadExternalPlugin(packageName, version) {
    try {
      const pluginModule = require(packageName);
      
      // External plugins should export generator metadata and classes
      if (pluginModule.generators && Array.isArray(pluginModule.generators)) {
        for (const generatorConfig of pluginModule.generators) {
          this.registerExternalGenerator(generatorConfig, packageName, version);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not load external plugin ${packageName}:`, error.message);
    }
  }

  /**
   * Register an external generator from a plugin
   */
  registerExternalGenerator(config, packageName, version) {
    const metadata = {
      ...config.metadata,
      packageName,
      version,
      isWorkspaceGenerator: false,
      isExternalPlugin: true
    };

    this.registerGenerator(config.name, {
      class: config.class,
      metadata,
      module: null,
      filePath: null
    });
  }

  /**
   * Register a generator in the registry
   */
  registerGenerator(name, generatorInfo) {
    this.generators.set(name, generatorInfo);
    this.pluginMetadata.set(name, generatorInfo.metadata);
    
    console.log(`📦 Registered generator: ${name} (${generatorInfo.metadata.type})`);
  }

  /**
   * Get a generator by name
   */
  getGenerator(name) {
    return this.generators.get(name);
  }

  /**
   * Get all registered generators
   */
  getAllGenerators() {
    return Array.from(this.generators.entries());
  }

  /**
   * Get generators by type
   */
  getGeneratorsByType(type) {
    return Array.from(this.generators.entries()).filter(
      ([name, info]) => info.metadata.type === type
    );
  }

  /**
   * Get generator metadata
   */
  getGeneratorMetadata(name) {
    return this.pluginMetadata.get(name);
  }

  /**
   * Create a generator instance
   */
  createGenerator(name, outputDir = './docs', services = null) {
    const generatorInfo = this.generators.get(name);
    if (!generatorInfo) {
      throw new Error(`Generator not found: ${name}`);
    }

    try {
      return new generatorInfo.class(outputDir, services);
    } catch (error) {
      throw new Error(`Failed to create generator ${name}: ${error.message}`);
    }
  }

  /**
   * Validate generator dependencies
   */
  validateGenerator(name) {
    const metadata = this.getGeneratorMetadata(name);
    if (!metadata) {
      return { valid: false, errors: [`Generator not found: ${name}`] };
    }

    const errors = [];
    
    // Check peer dependencies
    for (const [depName, depVersion] of Object.entries(metadata.peerDependencies)) {
      try {
        require.resolve(depName);
      } catch (error) {
        errors.push(`Missing peer dependency: ${depName}@${depVersion}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata
    };
  }

  /**
   * List all available generators with their metadata
   */
  listGenerators() {
    const generators = [];
    
    for (const [name, info] of this.generators.entries()) {
      generators.push({
        name,
        type: info.metadata.type,
        description: info.metadata.description,
        version: info.metadata.version,
        packageName: info.metadata.packageName,
        isExternal: info.metadata.isExternalPlugin
      });
    }

    return generators.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find the root package.json file
   */
  findRootPackageJson() {
    let currentDir = path.dirname(__filename);
    
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          // Check if this is the workspace root (has workspaces property)
          if (packageJson.workspaces) {
            return packageJsonPath;
          }
        } catch (error) {
          // Continue searching
        }
      }
      currentDir = path.dirname(currentDir);
    }
    
    return null;
  }
}

// Export singleton instance
export const generatorRegistry = new GeneratorRegistry();