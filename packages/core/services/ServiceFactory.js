/**
 * Service Factory
 *
 * Simple factory for creating service instances.
 * No caching - services are lightweight static methods.
 */

import { VersionService } from './VersionService.js';
import { BrandingService } from './BrandingService.js';
import { TemplateService } from './TemplateService.js';

export class ServiceFactory {
  /**
   * Create a service container with all services
   * @param {string} contextUrl - import.meta.url from the calling context
   * @param {Object} options - Configuration options
   * @returns {Object} Service container with all services
   */
  static createServices(contextUrl, options = {}) {
    const { excludeBrand = false } = options;

    return {
      version: {
        getCurrentVersion: () => VersionService.getCurrentVersion(contextUrl),
        getDisplayVersion: (packageName) => VersionService.getDisplayVersion(contextUrl, packageName),
        getPackageVersion: (path) => VersionService.getPackageVersion(path)
      },
      branding: {
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
        generateForHtml: () => BrandingService.generateHtmlBranding(contextUrl, excludeBrand),
        generateForMarkdown: () => BrandingService.generateMarkdownBranding(contextUrl, excludeBrand)
      },
      template: {
        getTemplatePath: (templateName) => TemplateService.getTemplatePath(contextUrl, templateName),
        readTemplate: (templateName) => TemplateService.readTemplate(contextUrl, templateName),
        renderTemplate: (templateName, data) => TemplateService.renderTemplate(contextUrl, templateName, data)
      }
    };
  }
}
