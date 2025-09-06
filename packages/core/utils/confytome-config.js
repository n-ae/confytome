/**
 * Simple confytome Configuration Utility
 *
 * Reads confytome.json and provides a simple way to configure server and routes
 * without complex JSDoc manipulation.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

export class ConfytomeConfig {
  /**
   * Check if a path is a network URL
   * @param {string} path - Path to check
   * @returns {boolean} True if path is a URL
   */
  static isNetworkPath(path) {
    try {
      const url = new URL(path);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Fetch content from a network URL
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} File content
   */
  static async fetchNetworkFile(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;

      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: HTTP ${response.statusCode}`));
          return;
        }

        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  /**
   * Download and cache a network file locally
   * @param {string} url - URL to download
   * @param {string} cacheDir - Directory to cache downloaded files
   * @returns {Promise<string>} Path to cached file
   */
  static async cacheNetworkFile(url, cacheDir = './confytome-cache') {
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log(`📁 Created cache directory: ${cacheDir}`);
    }

    // Generate cache filename from URL
    const urlHash = Buffer.from(url).toString('base64').replace(/[/+=]/g, '-');
    const cacheFile = path.join(cacheDir, `${urlHash}.js`);

    console.log(`📡 Downloading: ${url}`);

    try {
      const content = await this.fetchNetworkFile(url);
      fs.writeFileSync(cacheFile, content);
      console.log(`✅ Cached as: ${cacheFile}`);
      return cacheFile;
    } catch (error) {
      throw new Error(`Failed to download ${url}: ${error.message}`);
    }
  }

  /**
   * Load and parse confytome.json configuration
   * @param {string} configPath - Path to confytome.json (default: './confytome.json')
   * @returns {Promise<Object>} Configuration object with resolved file paths
   */
  static async load(configPath = './confytome.json') {
    if (!fs.existsSync(configPath)) {
      throw new Error(`confytome config not found: ${configPath}`);
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);

      // Validate required fields
      if (!config.serverConfig) {
        throw new Error('serverConfig is required in confytome.json');
      }

      if (!config.routeFiles || !Array.isArray(config.routeFiles)) {
        throw new Error('routeFiles array is required in confytome.json');
      }

      // Validate files exist
      const serverConfigPath = config.serverConfig;
      if (!fs.existsSync(serverConfigPath)) {
        throw new Error(`Server config file not found: ${serverConfigPath}`);
      }

      // All route files are now simple strings
      const routeFileNames = config.routeFiles;

      // Separate network paths from local paths
      const networkFiles = routeFileNames.filter(file => this.isNetworkPath(file));
      const localFiles = routeFileNames.filter(file => !this.isNetworkPath(file));

      // Validate local files exist
      const missingLocalFiles = localFiles.filter(file => !fs.existsSync(file));
      if (missingLocalFiles.length > 0) {
        throw new Error(`Local route files not found: ${missingLocalFiles.join(', ')}`);
      }

      // Download and cache network files
      const cachedNetworkFiles = {};
      if (networkFiles.length > 0) {
        console.log(`📡 Found ${networkFiles.length} network route file(s)`);

        for (const url of networkFiles) {
          try {
            const cachedPath = await this.cacheNetworkFile(url);
            cachedNetworkFiles[url] = cachedPath;
          } catch (error) {
            throw new Error(`Failed to fetch network file ${url}: ${error.message}`);
          }
        }
      }

      // Update route files with cached paths for network files
      config.routeFiles = config.routeFiles.map(route => {
        return this.isNetworkPath(route) ? cachedNetworkFiles[route] : route;
      });

      console.log('✅ Loaded confytome.json configuration');
      console.log(`   Server config: ${serverConfigPath}`);
      console.log(`   Route files: ${config.routeFiles.length} files`);
      console.log('   💡 Server overrides: Use standard OpenAPI "servers:" in JSDoc comments');

      return config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in confytome.json: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the server URL for a specific route file
   * Server overrides are now handled directly in JSDoc @swagger servers: field
   * @param {Object} config - Configuration object from load()
   * @param {string} _routeFileName - Path to the route file
   * @returns {string} Server URL to use for this route file
   */
  static getServerForRoute(config, _routeFileName) {
    // Server overrides handled in JSDoc - return default server
    const serverConfig = JSON.parse(fs.readFileSync(config.serverConfig, 'utf8'));
    if (serverConfig.servers && serverConfig.servers.length > 0) {
      return serverConfig.servers[serverConfig.servers.length - 1].url;
    }

    throw new Error('No servers configured in server config');
  }

  /**
   * Get array of route file names from the configuration
   * @param {Object} config - Configuration object from load()
   * @returns {Array<string>} Array of route file paths
   */
  static getRouteFileNames(config) {
    return config.routeFiles;
  }

  /**
   * Create a modified server config with server overrides integrated
   * @param {Object} config - Configuration object from load()
   * @returns {Object} Server configuration (no custom extensions - operation.servers used instead)
   */
  static createModifiedServerConfig(config) {
    const serverConfig = JSON.parse(fs.readFileSync(config.serverConfig, 'utf8'));

    // Return clean server config - server overrides will be applied at operation level
    // following OpenAPI standards via operation.servers

    return serverConfig;
  }
}

export default ConfytomeConfig;
