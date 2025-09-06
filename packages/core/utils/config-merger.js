/**
 * Configuration Merger Utility
 *
 * Merges CLI options with configuration files to create a unified config,
 * ensuring the app always sources configuration from JSON.
 */

import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export class ConfigMerger {
  /**
   * Merge CLI options with a configuration file
   * @param {string} configPath - Path to the base configuration file
   * @param {Object} cliOptions - CLI options to merge/override
   * @param {string} tempDir - Directory for temporary config files (default: './docs')
   * @returns {Promise<{configPath: string, isTemporary: boolean}>}
   */
  static async mergeWithConfig(configPath, cliOptions, tempDir = './docs') {
    // Read the base configuration
    let baseConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        baseConfig = JSON.parse(configContent);
      } catch (error) {
        throw new Error(`Failed to parse config file ${configPath}: ${error.message}`);
      }
    }

    // Create merged configuration
    const mergedConfig = this.mergeConfigurations(baseConfig, cliOptions);

    // Check if we need to create a temporary config file
    const hasOverrides = this.hasOverrides(baseConfig, cliOptions);

    if (!hasOverrides) {
      // No overrides needed, use original config
      return {
        configPath,
        isTemporary: false,
        config: mergedConfig
      };
    }

    // Create temporary config file
    return await this.createTemporaryConfig(mergedConfig, tempDir);
  }

  /**
   * Merge configurations with CLI options taking precedence
   * @param {Object} baseConfig - Base configuration from file
   * @param {Object} cliOptions - CLI options to merge
   * @returns {Object} Merged configuration
   */
  static mergeConfigurations(baseConfig, cliOptions) {
    const merged = { ...baseConfig };

    // Define all possible option mappings (CLI option -> config property)
    const optionMappings = {
      // Path and output options
      config: 'configPath',
      output: 'outputDir',
      spec: 'specPath',

      // Content options
      files: 'routeFiles',
      serverConfig: 'serverConfig',

      // Feature flags
      noBrand: 'excludeBrand',
      watch: 'watchMode',

      // Direct mappings (same name in CLI and config)
      routeFiles: 'routeFiles',
      excludeBrand: 'excludeBrand',
      outputDir: 'outputDir',
      specPath: 'specPath',
      watchMode: 'watchMode'
    };

    // Apply CLI overrides with precedence
    for (const [cliKey, configKey] of Object.entries(optionMappings)) {
      if (cliOptions[cliKey] !== undefined && cliOptions[cliKey] !== null) {
        merged[configKey] = cliOptions[cliKey];
      }
    }

    // Handle special Commander.js --no-* options (they become false instead of true)
    if (cliOptions.brand === false) {
      merged.excludeBrand = true;
    }

    // Handle special cases and validation
    this.validateMergedConfig(merged);

    return merged;
  }

  /**
   * Validate merged configuration for consistency
   * @param {Object} config - Merged configuration to validate
   */
  static validateMergedConfig(config) {
    // Ensure consistent path handling
    if (config.outputDir && !path.isAbsolute(config.outputDir)) {
      config.outputDir = path.resolve(config.outputDir);
    }

    // Ensure routeFiles is always an array
    if (config.routeFiles && !Array.isArray(config.routeFiles)) {
      config.routeFiles = [config.routeFiles];
    }
  }

  /**
   * Check if CLI options would override any config values
   * @param {Object} baseConfig - Base configuration
   * @param {Object} cliOptions - CLI options
   * @returns {boolean} True if overrides exist
   */
  static hasOverrides(baseConfig, cliOptions) {
    const optionMappings = {
      // Path and output options
      config: 'configPath',
      output: 'outputDir',
      spec: 'specPath',

      // Content options
      files: 'routeFiles',
      serverConfig: 'serverConfig',

      // Feature flags
      noBrand: 'excludeBrand',
      watch: 'watchMode',

      // Direct mappings (same name in CLI and config)
      routeFiles: 'routeFiles',
      excludeBrand: 'excludeBrand',
      outputDir: 'outputDir',
      specPath: 'specPath',
      watchMode: 'watchMode'
    };

    // Check all mapped options for differences
    for (const [cliKey, configKey] of Object.entries(optionMappings)) {
      if (cliOptions[cliKey] !== undefined && cliOptions[cliKey] !== null) {
        const cliValue = cliOptions[cliKey];
        const configValue = baseConfig[configKey];

        // Compare values (deep comparison for objects/arrays)
        if (JSON.stringify(cliValue) !== JSON.stringify(configValue)) {
          return true;
        }
      }
    }

    // Handle special Commander.js --no-* options
    if (cliOptions.brand === false && baseConfig.excludeBrand !== true) {
      return true;
    }

    return false;
  }

  /**
   * Create a temporary configuration file
   * @param {Object} config - Configuration to write
   * @param {string} tempDir - Directory for temporary files
   * @returns {Promise<{configPath: string, isTemporary: boolean}>}
   */
  static async createTemporaryConfig(config, tempDir) {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate unique temporary filename
    const randomId = randomBytes(8).toString('hex');
    const tempConfigPath = path.join(tempDir, `.confytome-temp-${randomId}.json`);

    // Write temporary config
    try {
      fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to create temporary config file: ${error.message}`);
    }

    return {
      configPath: tempConfigPath,
      isTemporary: true,
      config
    };
  }

  /**
   * Clean up temporary configuration file
   * @param {string} configPath - Path to temporary config file
   * @param {boolean} isTemporary - Whether the file is temporary
   */
  static cleanup(configPath, isTemporary) {
    if (isTemporary && fs.existsSync(configPath)) {
      try {
        fs.unlinkSync(configPath);
      } catch (error) {
        // Silently ignore cleanup errors
        console.warn(`Warning: Failed to cleanup temporary config file: ${configPath}`);
      }
    }
  }

  /**
   * Extract CLI options from commander options object
   * @param {Object} commanderOptions - Commander.js options object
   * @returns {Object} Cleaned CLI options
   */
  static extractCliOptions(commanderOptions) {
    const cleaned = {};

    // Skip commander.js internal properties and undefined values
    for (const [key, value] of Object.entries(commanderOptions)) {
      if (!key.startsWith('_') && value !== undefined) {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}
