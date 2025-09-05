/**
 * Version Service
 * 
 * Centralized service for managing package version information across all generators.
 * Eliminates the duplication of package.json reading logic in every generator.
 */

import fs from 'fs';
import path from 'path';

export class VersionService {
  static #versionCache = new Map();

  /**
   * Get the version of a package from its package.json
   * @param {string} packagePath - Path to the package directory or import.meta.url
   * @returns {string} Version string or 'unknown' if not found
   */
  static getPackageVersion(packagePath) {
    // Handle import.meta.url format
    if (packagePath.startsWith('file://')) {
      packagePath = new URL('./package.json', packagePath).pathname;
    } else if (!packagePath.endsWith('package.json')) {
      packagePath = path.join(packagePath, 'package.json');
    }

    // Check cache first
    if (this.#versionCache.has(packagePath)) {
      return this.#versionCache.get(packagePath);
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const version = packageJson.version || 'unknown';
      
      // Cache the result
      this.#versionCache.set(packagePath, version);
      
      return version;
    } catch (error) {
      console.warn(`Warning: Could not read version from ${packagePath}: ${error.message}`);
      
      // Cache the failure to avoid repeated attempts
      this.#versionCache.set(packagePath, 'unknown');
      
      return 'unknown';
    }
  }

  /**
   * Get the current package version (for use in generators)
   * Uses import.meta.url from the calling context
   * @param {string} importMetaUrl - import.meta.url from the generator
   * @returns {string} Version string
   */
  static getCurrentVersion(importMetaUrl) {
    return this.getPackageVersion(importMetaUrl);
  }

  /**
   * Get version with package name for display purposes
   * @param {string} packagePath - Path to package or import.meta.url
   * @param {string} packageName - Optional package name (defaults to reading from package.json)
   * @returns {string} Formatted version string like "@confytome/markdown v1.1.3"
   */
  static getDisplayVersion(packagePath, packageName = null) {
    const version = this.getPackageVersion(packagePath);
    
    if (!packageName) {
      try {
        const resolvedPath = packagePath.startsWith('file://') 
          ? new URL('./package.json', packagePath).pathname
          : path.join(packagePath, 'package.json');
        
        const packageJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        packageName = packageJson.name || 'unknown';
      } catch (error) {
        packageName = 'unknown';
      }
    }

    return `${packageName} v${version}`;
  }

  /**
   * Clear the version cache (useful for testing)
   */
  static clearCache() {
    this.#versionCache.clear();
  }

  /**
   * Get cache statistics (for debugging)
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.#versionCache.size,
      entries: Array.from(this.#versionCache.entries()).map(([path, version]) => ({
        path: path.replace(process.cwd(), '.'),
        version
      }))
    };
  }
}

export default VersionService;