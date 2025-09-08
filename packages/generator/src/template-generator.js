/**
 * Template Generator Utility
 *
 * Uses Mustache templates to generate CLI files
 * to reduce repetition across generator packages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Mustache from 'mustache';
import { getCLITemplateData } from './cli-template-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '../templates');

/**
 * Generate CLI file for a generator package
 * @param {string} generatorType - Type of generator (html, markdown, swagger, postman)
 * @param {Object} options - Additional template options
 * @returns {string} Generated CLI file content
 */
export function generateCLIFile(generatorType, options = {}) {
  const templateData = getCLITemplateData(generatorType);
  const cliTemplatePath = path.join(templatesDir, 'cli.mustache');

  if (!fs.existsSync(cliTemplatePath)) {
    throw new Error(`CLI template not found: ${cliTemplatePath}`);
  }

  const template = fs.readFileSync(cliTemplatePath, 'utf8');

  // Enhanced template data with additional options
  const data = {
    ...templateData,
    packageName: `@confytome/${generatorType}`,
    className: templateData.info.className,
    mainFile: `generate-${generatorType}.js`,
    progressMessage: `Generating ${templateData.info.name}`,
    cliHelper: options.cliHelper || 'cli-helper.js',
    ...options
  };

  // Process options to include default value handling
  data.options = data.options.map(option => ({
    ...option,
    defaultValue: option.defaultValue?.startsWith('DEFAULT_')
      ? option.defaultValue
      : option.defaultValue ? `'${option.defaultValue}'` : null
  }));

  return Mustache.render(template, data);
}


/**
 * Write generated CLI file to package directory
 * @param {string} generatorType - Type of generator
 * @param {string} packagePath - Path to the generator package directory
 * @param {Object} options - Additional template options
 */
export async function writeCLIFile(generatorType, packagePath, options = {}) {
  const cliContent = generateCLIFile(generatorType, options);
  const cliPath = path.join(packagePath, 'cli.js');

  fs.writeFileSync(cliPath, cliContent, 'utf8');

  // Make CLI file executable
  if (process.platform !== 'win32') {
    fs.chmodSync(cliPath, '755');
  }

  return cliPath;
}


export default {
  generateCLIFile,
  writeCLIFile
};
