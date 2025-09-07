/**
 * Template Generator Utility
 * 
 * Uses Mustache templates to generate CLI files and plugin manifests
 * to reduce repetition across generator packages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
 * Generate plugin manifest for a generator package
 * @param {string} generatorType - Type of generator
 * @param {Object} options - Additional manifest options
 * @returns {string} Generated plugin manifest JSON content
 */
export function generatePluginManifest(generatorType, options = {}) {
  const templateData = getCLITemplateData(generatorType);
  const manifestTemplatePath = path.join(templatesDir, 'plugin-manifest.mustache');
  
  if (!fs.existsSync(manifestTemplatePath)) {
    throw new Error(`Plugin manifest template not found: ${manifestTemplatePath}`);
  }

  const template = fs.readFileSync(manifestTemplatePath, 'utf8');
  
  // Map dependencies to template format
  const dependencies = templateData.info.dependencies.map((dep, index, array) => {
    const versions = {
      'commander': '^14.0.0',
      'mustache': '^4.2.0', 
      'swagger-ui-dist': '^5.0.0'
    };
    
    return {
      name: dep,
      version: versions[dep] || '^1.0.0',
      last: index === array.length - 1
    };
  });

  // Map tags to template format  
  const tagList = [generatorType];
  if (templateData.info.outputFormat === 'html') tagList.push('documentation');
  if (generatorType === 'markdown') tagList.push('confluence', 'mustache');
  
  const tags = tagList.map((tag, index, array) => ({
    value: tag,
    last: index === array.length - 1
  }));

  // Enhanced template data
  const data = {
    generatorType,
    description: templateData.info.description,
    mainFile: `generate-${generatorType}.js`,
    className: templateData.info.className,
    version: options.version || '1.4.3',
    author: options.author || 'nae',
    tags,
    dependencies,
    coreVersion: options.coreVersion || '^1.2.0',
    outputFiles: templateData.info.outputFiles.map((file, index, array) => ({
      value: file,
      last: index === array.length - 1
    })),
    outputFormat: templateData.info.outputFormat,
    externalTools: options.externalTools || [],
    hasExternalTools: (options.externalTools || []).length > 0,
    ...options
  };

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

/**
 * Write generated plugin manifest to package directory
 * @param {string} generatorType - Type of generator
 * @param {string} packagePath - Path to the generator package directory  
 * @param {Object} options - Additional manifest options
 */
export async function writePluginManifest(generatorType, packagePath, options = {}) {
  const manifestContent = generatePluginManifest(generatorType, options);
  const manifestPath = path.join(packagePath, 'confytome-plugin.json');
  
  fs.writeFileSync(manifestPath, manifestContent, 'utf8');
  
  return manifestPath;
}

export default {
  generateCLIFile,
  generatePluginManifest,
  writeCLIFile,
  writePluginManifest
};