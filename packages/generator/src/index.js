/**
 * @confytome/generator
 *
 * Template generation system for confytome CLI files, manifests, and documentation.
 * Provides centralized template management using Mustache templating.
 */

export {
  generateCLIFile,
  generatePluginManifest,
  writeCLIFile,
  writePluginManifest
} from './template-generator.js';

export {
  generateREADME,
  writeREADME,
  generateAllREADMEs,
  validateREADMETemplates,
  compareREADMEApproaches
} from './mustache-readme-generator.js';

export {
  README_TEMPLATE_DATA,
  getREADMETemplateData
} from './readme-template-data.js';

export {
  getCLITemplateData
} from './cli-template-data.js';
