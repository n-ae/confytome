/**
 * Simplified Generator Registry with Manifest-Based Plugin Discovery
 *
 * Replaces complex reflection-based discovery with simple manifest files.
 * Each plugin package contains a confytome-plugin.json file describing the generator.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GeneratorRegistry {
  constructor() {
    this.generators = new Map();
    this.manifests = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the registry by reading manifest files
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('🔌 Discovering generators via manifest files...');

    // Discover workspace generators via manifest files
    await this.discoverWorkspaceGenerators();

    // Discover external plugins (future feature)
    await this.discoverExternalPlugins();

    this.initialized = true;
    console.log(`✅ Discovered ${this.generators.size} generators`);
  }

  /**
   * Discover generators in workspace packages by reading manifest files
   */
  async discoverWorkspaceGenerators() {
    try {
      const packagesRoot = path.resolve(__dirname, '../../../');
      const manifestFiles = await glob('packages/*/confytome-plugin.json', { cwd: packagesRoot });

      console.log(`   Found ${manifestFiles.length} manifest files`);

      for (const manifestFile of manifestFiles) {
        const manifestPath = path.join(packagesRoot, manifestFile);
        await this.loadGeneratorFromManifest(manifestPath);
      }
    } catch (error) {
      console.warn('Warning: Could not discover workspace generators:', error.message);
    }
  }

  /**
   * Discover external generator plugins (placeholder for future expansion)
   */
  async discoverExternalPlugins() {
    // Future: Scan node_modules for packages with confytome-plugin.json files
    // This would allow third-party plugins while maintaining the simple manifest approach
  }

  /**
   * Load a generator from its manifest file
   */
  async loadGeneratorFromManifest(manifestPath) {
    try {
      // Read and parse manifest
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Validate required manifest fields
      if (!this.isValidManifest(manifest)) {
        console.warn(`Invalid manifest: ${manifestPath}`);
        return;
      }

      // Resolve generator file path
      const packageDir = path.dirname(manifestPath);
      const generatorPath = path.join(packageDir, manifest.main);

      if (!fs.existsSync(generatorPath)) {
        console.warn(`Generator file not found: ${generatorPath}`);
        return;
      }

      // Load the generator module
      const fileUrl = `file://${generatorPath}`;
      const module = await import(fileUrl);

      // Get the generator class
      const GeneratorClass = module[manifest.className] || this.findDefaultExport(module);

      if (!GeneratorClass) {
        console.warn(`Generator class ${manifest.className} not found in ${generatorPath}`);
        return;
      }

      // Register the generator
      this.registerGenerator(manifest.name, {
        class: GeneratorClass,
        manifest,
        module,
        filePath: generatorPath
      });

      console.log(`   ✓ Loaded ${manifest.name} generator`);

    } catch (error) {
      console.warn(`Failed to load generator from ${manifestPath}:`, error.message);
    }
  }

  /**
   * Validate that a manifest has required fields
   */
  isValidManifest(manifest) {
    const required = ['name', 'type', 'main', 'className'];
    return required.every(field => manifest[field]);
  }

  /**
   * Find the default export from a module (fallback if className not found)
   */
  findDefaultExport(module) {
    // Look for default export
    if (module.default && typeof module.default === 'function') {
      return module.default;
    }

    // Look for any function that looks like a generator class
    const exports = Object.values(module);
    return exports.find(exp =>
      typeof exp === 'function' &&
      exp.prototype &&
      typeof exp.prototype.generate === 'function'
    );
  }

  /**
   * Register a generator in the registry
   */
  registerGenerator(name, generatorInfo) {
    this.generators.set(name, generatorInfo);
    this.manifests.set(name, generatorInfo.manifest);
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
    return Array.from(this.generators.entries())
      .filter(([_, info]) => info.manifest.type === type)
      .map(([name]) => name);
  }

  /**
   * Get generator manifest
   */
  getManifest(name) {
    return this.manifests.get(name);
  }

  /**
   * Create a generator instance
   */
  createGenerator(name, outputDir = './docs', services = null) {
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
   * Get generator info for debugging
   */
  getGeneratorInfo(name) {
    const info = this.generators.get(name);
    if (!info) return null;

    return {
      name,
      type: info.manifest.type,
      description: info.manifest.description,
      version: info.manifest.version,
      outputs: info.manifest.outputs,
      standalone: info.manifest.standalone || false,
      filePath: info.filePath
    };
  }

  /**
   * List all generators with their info
   */
  listGenerators() {
    return Array.from(this.generators.keys()).map(name => this.getGeneratorInfo(name));
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

    // Check if external tools are noted (informational only)
    if (generator.manifest.externalTools?.length > 0) {
      warnings.push(`Uses external tools: ${generator.manifest.externalTools.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const generatorRegistry = new GeneratorRegistry();
