/**
 * Branding Service
 *
 * Centralized service for managing confytome branding across all generators.
 * Provides consistent branding formats and handles the excludeBrand option uniformly.
 */

import { VersionService } from './VersionService.js';

export class BrandingService {
  static #brandingConfig = {
    projectName: 'confytome',
    projectIcon: '🍃',
    projectUrl: 'https://github.com/n-ae/confytome',
    heartIcon: '❤️',
    heartIconAlt: '<3' // Alternative for markdown/text
  };

  /**
   * Generate timestamp in confytome standard format (UTC military time)
   * @returns {string} Formatted timestamp
   */
  static getTimestamp() {
    return new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  }

  /**
   * Generate branding text for generators
   * @param {string} importMetaUrl - import.meta.url from the generator
   * @param {boolean} excludeBrand - Whether to exclude confytome branding
   * @param {Object} options - Formatting options
   * @param {string} options.format - Output format: 'html', 'markdown', 'text'
   * @param {boolean} options.includeTimestamp - Whether to include timestamp
   * @param {boolean} options.includeVersion - Whether to include version
   * @returns {string} Branding text or empty string if excluded
   */
  static generateBranding(importMetaUrl, excludeBrand = false, options = {}) {
    const {
      format = 'text',
      includeTimestamp = true,
      includeVersion = true
    } = options;

    if (excludeBrand) {
      if (includeTimestamp) {
        const timestamp = this.getTimestamp();
        return format === 'html'
          ? `Generated: ${timestamp} UTC`
          : `Generated ${timestamp} UTC`;
      }
      return '';
    }

    const timestamp = includeTimestamp ? this.getTimestamp() : null;
    const version = includeVersion ? VersionService.getCurrentVersion(importMetaUrl) : null;

    switch (format) {
    case 'html':
      return this.#generateHtmlBranding(timestamp, version);
    case 'markdown':
      return this.#generateMarkdownBranding(timestamp, version);
    case 'text':
    default:
      return this.#generateTextBranding(timestamp, version);
    }
  }

  /**
   * Generate HTML branding
   * @private
   */
  static #generateHtmlBranding(timestamp, version) {
    const { projectName, projectIcon, projectUrl, heartIcon } = this.#brandingConfig;

    let branding = '';
    if (timestamp) {
      branding += `<small>Generated: ${timestamp} UTC</small>`;
    }

    if (version) {
      const versionText = version !== 'unknown' ? `v${version}` : '';
      branding += timestamp ? '<br>' : '';
      branding += `<small>Generated with ${projectIcon} <a href="${projectUrl}" style="color: inherit; text-decoration: none;">${projectName}${versionText ? ` ${versionText}` : ''}</a> with ${heartIcon}</small>`;
    }

    return branding;
  }

  /**
   * Generate Markdown branding
   * @private
   */
  static #generateMarkdownBranding(timestamp, version) {
    const { projectName, projectIcon, heartIconAlt } = this.#brandingConfig;

    const parts = [];
    if (timestamp) {
      parts.push(`Generated ${timestamp} UTC`);
    }

    if (version) {
      const versionText = version !== 'unknown' ? ` v${version}` : '';
      parts.push(`by ${projectIcon} ${projectName}${versionText} with ${heartIconAlt}`);
    }

    return `*${parts.join(' ')}*`;
  }

  /**
   * Generate plain text branding
   * @private
   */
  static #generateTextBranding(timestamp, version) {
    const { projectName, projectIcon } = this.#brandingConfig;

    const parts = [];
    if (timestamp) {
      parts.push(`Generated ${timestamp} UTC`);
    }

    if (version) {
      const versionText = version !== 'unknown' ? ` v${version}` : '';
      parts.push(`by ${projectIcon} ${projectName}${versionText}`);
    }

    return parts.join(' ');
  }

  /**
   * Generate environment variables for template engines (like widdershins)
   * @param {string} importMetaUrl - import.meta.url from the generator
   * @param {boolean} excludeBrand - Whether to exclude branding
   * @returns {Object} Environment variables to pass to template engine
   */
  static getTemplateEnvironment(importMetaUrl, excludeBrand = false) {
    const env = {};

    if (excludeBrand) {
      env.CONFYTOME_NO_BRAND = 'true';
    }

    if (!excludeBrand) {
      const version = VersionService.getCurrentVersion(importMetaUrl);
      env.CONFYTOME_VERSION = version;
    }

    return env;
  }

  /**
   * Generate branding for specific generator types
   */
  static generateHtmlBranding(importMetaUrl, excludeBrand = false) {
    return this.generateBranding(importMetaUrl, excludeBrand, {
      format: 'html',
      includeTimestamp: true,
      includeVersion: true
    });
  }

  static generateMarkdownBranding(importMetaUrl, excludeBrand = false) {
    return this.generateBranding(importMetaUrl, excludeBrand, {
      format: 'markdown',
      includeTimestamp: true,
      includeVersion: true
    });
  }

  static generateSwaggerBranding(importMetaUrl, excludeBrand = false) {
    // Swagger uses HTML format in the footer
    return this.generateHtmlBranding(importMetaUrl, excludeBrand);
  }

  /**
   * Update branding configuration (for customization)
   * @param {Object} config - New branding configuration
   */
  static updateConfig(config) {
    this.#brandingConfig = { ...this.#brandingConfig, ...config };
  }

  /**
   * Get current branding configuration
   * @returns {Object} Current branding configuration
   */
  static getConfig() {
    return { ...this.#brandingConfig };
  }
}

export default BrandingService;
