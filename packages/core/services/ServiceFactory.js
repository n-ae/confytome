/**
 * Service Factory
 *
 * Factory for creating and managing service instances with dependency injection.
 * Provides a clean way to inject services into generators and other components.
 */

import { VersionService } from './VersionService.js';
import { BrandingService } from './BrandingService.js';
import { TemplateService } from './TemplateService.js';

export class ServiceFactory {
  static #instances = new Map();

  /**
   * Create a service container with all services
   * @param {string} contextUrl - import.meta.url from the calling context
   * @param {Object} options - Configuration options
   * @returns {Object} Service container with all services
   */
  static createServices(contextUrl, options = {}) {
    const serviceId = `${contextUrl}:${JSON.stringify(options)}`;

    // Return cached instance if available
    if (this.#instances.has(serviceId)) {
      return this.#instances.get(serviceId);
    }

    // Create service container
    const services = {
      version: this.#createVersionService(contextUrl),
      branding: this.#createBrandingService(contextUrl, options),
      template: this.#createTemplateService(contextUrl)
    };

    // Cache the services
    this.#instances.set(serviceId, services);

    return services;
  }

  /**
   * Create VersionService instance with context
   * @private
   */
  static #createVersionService(contextUrl) {
    return {
      getCurrentVersion: () => VersionService.getCurrentVersion(contextUrl),
      getDisplayVersion: (packageName) => VersionService.getDisplayVersion(contextUrl, packageName),
      getPackageVersion: (path) => VersionService.getPackageVersion(path)
    };
  }

  /**
   * Create BrandingService instance with context
   * @private
   */
  static #createBrandingService(contextUrl, options) {
    const { excludeBrand = false } = options;

    return {
      generateHtml: (opts = {}) => BrandingService.generateHtmlBranding(
        contextUrl,
        opts.excludeBrand ?? excludeBrand
      ),
      generateMarkdown: (opts = {}) => BrandingService.generateMarkdownBranding(
        contextUrl,
        opts.excludeBrand ?? excludeBrand
      ),
      generateSwagger: (opts = {}) => BrandingService.generateSwaggerBranding(
        contextUrl,
        opts.excludeBrand ?? excludeBrand
      ),
      getTimestamp: () => BrandingService.getTimestamp(),
      getTemplateData: (opts = {}) => {
        const shouldExcludeBrand = opts.excludeBrand ?? excludeBrand;
        return {
          excludeBrand: shouldExcludeBrand,
          timestamp: BrandingService.getTimestamp(),
          version: shouldExcludeBrand ? null : VersionService.getCurrentVersion(contextUrl),
          projectName: 'confytome',
          projectIcon: '🍃',
          heartIcon: '<3'
        };
      }
    };
  }

  /**
   * Create TemplateService instance with context
   * @private
   */
  static #createTemplateService(contextUrl) {
    return {
      getWiddershinsPath: (packagePath) => TemplateService.getWiddershinsTemplatesPath(packagePath || contextUrl),
      readTemplate: (path, encoding) => TemplateService.readTemplate(path, encoding),
      writeTemplate: (path, content, encoding) => TemplateService.writeTemplate(path, content, encoding),
      processTemplate: (template, variables) => TemplateService.processTemplate(template, variables),
      templateExists: (path) => TemplateService.templateExists(path)
    };
  }

  /**
   * Create services for a specific generator type
   * @param {string} contextUrl - import.meta.url from the generator
   * @param {string} generatorType - Type of generator (markdown, html, swagger, etc.)
   * @param {Object} options - Generator-specific options
   * @returns {Object} Service container optimized for generator type
   */
  static createGeneratorServices(contextUrl, generatorType, options = {}) {
    const services = this.createServices(contextUrl, options);

    // Add generator-specific convenience methods
    switch (generatorType) {
    case 'markdown':
      services.branding.generateForMarkdown = () => services.branding.generateMarkdown();
      services.branding.getMarkdownTemplateData = () => services.branding.getTemplateData();
      break;

    case 'html':
      services.branding.generateForHtml = () => services.branding.generateHtml();
      break;

    case 'swagger':
      services.branding.generateForSwagger = () => services.branding.generateSwagger();
      break;
    }

    return services;
  }

  /**
   * Clear the service cache (useful for testing)
   */
  static clearCache() {
    this.#instances.clear();
  }

  /**
   * Get cache statistics (for debugging)
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      size: this.#instances.size,
      services: Array.from(this.#instances.keys())
    };
  }
}

export default ServiceFactory;
