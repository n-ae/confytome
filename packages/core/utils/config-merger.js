/**
 * Configuration Merger Utility
 *
 * Simple configuration merging without temporary file creation.
 * Merges CLI options with configuration files in memory only.
 */

import fs from 'node:fs';

export class ConfigMerger {
  /**
   * Merge CLI options with a configuration file
   * @param {string} configPath - Path to the base configuration file
   * @param {Object} cliOptions - CLI options to merge/override
   * @returns {Object} Merged configuration object
   */
  static mergeWithConfig(configPath, cliOptions) {
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

    // Create and return merged configuration
    return this.mergeConfigurations(baseConfig, cliOptions);
  }

  /**
   * Merge configurations with CLI options taking precedence
   * @param {Object} baseConfig - Base configuration from file
   * @param {Object} cliOptions - CLI options to merge
   * @returns {Object} Merged configuration
   */
  static mergeConfigurations(baseConfig, cliOptions) {
    const merged = { ...baseConfig };

    // Simple option mappings (CLI option -> config property)
    const optionMappings = {
      output: 'outputDir',
      spec: 'specPath',
      files: 'routeFiles',
      serverConfig: 'serverConfig',
      noBrand: 'excludeBrand'
    };

    // Apply CLI overrides
    for (const [cliKey, configKey] of Object.entries(optionMappings)) {
      if (cliOptions[cliKey] !== undefined && cliOptions[cliKey] !== null) {
        merged[configKey] = cliOptions[cliKey];
      }
    }

    // Handle Commander.js --no-brand option
    if (cliOptions.brand === false) {
      merged.excludeBrand = true;
    }

    // Basic validation
    if (merged.routeFiles && !Array.isArray(merged.routeFiles)) {
      merged.routeFiles = [merged.routeFiles];
    }

    return merged;
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

  /**
   * Create temporary config - simplified to just return the config object
   * @param {Object} config - Configuration object
   * @returns {Object} Config wrapper with backward compatibility
   */
  static createTemporaryConfig(config) {
    return {
      configPath: null, // No file created
      isTemporary: false, // No cleanup needed
      config
    };
  }

  /**
   * Cleanup method for backward compatibility - no-op
   * @param {string} _configPath - Ignored
   * @param {boolean} _isTemporary - Ignored
   */
  static cleanup(_configPath, _isTemporary) {
    // No-op - no temporary files to clean up
  }
}
