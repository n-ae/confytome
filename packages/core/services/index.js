/**
 * Confytome Core Services
 *
 * Centralized services for shared functionality across all generators.
 * This eliminates code duplication and provides consistent behavior.
 */

export { VersionService } from './VersionService.js';
export { BrandingService } from './BrandingService.js';
export { TemplateService } from './TemplateService.js';
export { ServiceFactory } from './ServiceFactory.js';

// Re-export default exports for convenience
export { default as VersionServiceDefault } from './VersionService.js';
export { default as BrandingServiceDefault } from './BrandingService.js';
export { default as TemplateServiceDefault } from './TemplateService.js';
export { default as ServiceFactoryDefault } from './ServiceFactory.js';
