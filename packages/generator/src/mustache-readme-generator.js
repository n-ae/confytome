/**
 * Mustache-based README Generator
 *
 * Enhanced README generation using real Mustache templating
 * with support for conditionals, loops, and structured data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';
import { README_TEMPLATE_DATA, getREADMETemplateData } from './readme-template-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '../templates');
const rootDir = path.resolve(__dirname, '../../..');

/**
 * Generate README content using Mustache templates
 * @param {string} packageType - Type of package (workspace, core, html, markdown, etc.)
 * @param {Object} options - Additional template options
 * @returns {string} Generated README content
 */
export function generateREADME(packageType, options = {}) {
  let templateData;
  let templateName;

  // Handle special package types
  if (packageType === 'workspace') {
    templateData = README_TEMPLATE_DATA.workspace.data;
    templateName = 'README-workspace.mustache';
  } else if (packageType === 'core') {
    templateData = README_TEMPLATE_DATA.core.data;
    templateName = 'README-core.mustache';
  } else {
    // Generator packages
    templateData = getREADMETemplateData(packageType);
    templateName = 'README-generator.mustache';
  }

  // Load template
  const templatePath = path.join(templatesDir, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  // Merge with additional options
  const finalData = { ...templateData, ...options };

  // Add numbered ordering for usage steps if needed
  if (finalData.outputExamples?.usage) {
    finalData.outputExamples.usage = finalData.outputExamples.usage.map((step, index) =>
      `${index + 1}. ${step}`
    );
  }

  // Render template
  return Mustache.render(template, finalData);
}

/**
 * Write README file to specified directory
 * @param {string} packageType - Type of package
 * @param {string} outputDir - Directory to write README.md
 * @param {Object} options - Additional template options
 * @returns {string} Path to generated README file
 */
export function writeREADME(packageType, outputDir, options = {}) {
  const content = generateREADME(packageType, options);
  const outputPath = path.join(outputDir, 'README.md');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

/**
 * Generate READMEs for all packages
 * @param {Object} options - Generation options
 * @returns {Array} Array of generated file paths
 */
export async function generateAllREADMEs(options = {}) {
  const packages = [
    { type: 'workspace', path: rootDir },
    { type: 'core', path: path.join(rootDir, 'packages', 'core') },
    { type: 'html', path: path.join(rootDir, 'packages', 'html') },
    { type: 'markdown', path: path.join(rootDir, 'packages', 'markdown') },
    { type: 'swagger', path: path.join(rootDir, 'packages', 'swagger') },
    { type: 'postman', path: path.join(rootDir, 'packages', 'postman') }
  ];

  const results = [];

  for (const pkg of packages) {
    try {
      if (!fs.existsSync(pkg.path)) {
        console.warn(`⚠️  Package directory not found: ${pkg.path}`);
        continue;
      }

      console.log(`📝 Generating README for ${pkg.type}...`);
      const readmePath = writeREADME(pkg.type, pkg.path, options);

      results.push({
        type: pkg.type,
        path: readmePath,
        relativePath: path.relative(rootDir, readmePath)
      });

      console.log(`✅ Generated: ${path.relative(rootDir, readmePath)}`);
    } catch (error) {
      console.error(`❌ Error generating README for ${pkg.type}:`, error.message);
      results.push({
        type: pkg.type,
        path: null,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Validate README templates
 * @returns {boolean} True if all templates are valid
 */
export function validateREADMETemplates() {
  console.log('🔍 Validating README templates...');

  const templates = [
    'README-workspace.mustache',
    'README-core.mustache',
    'README-generator.mustache'
  ];

  let allValid = true;

  for (const templateName of templates) {
    const templatePath = path.join(templatesDir, templateName);

    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Template not found: ${templateName}`);
      allValid = false;
      continue;
    }

    try {
      const template = fs.readFileSync(templatePath, 'utf8');

      // Basic Mustache syntax validation
      const unclosedTags = template.match(/\{\{[^}]*$/gm);
      if (unclosedTags) {
        console.error(`❌ Unclosed tags in ${templateName}:`, unclosedTags);
        allValid = false;
      }

      console.log(`✅ ${templateName} is valid`);
    } catch (error) {
      console.error(`❌ Error reading ${templateName}:`, error.message);
      allValid = false;
    }
  }

  if (allValid) {
    console.log('✅ All README templates are valid');
  }

  return allValid;
}

/**
 * Compare old vs new README generation approaches
 * @param {string} packageType - Package type to compare
 * @returns {Object} Comparison results
 */
export function compareREADMEApproaches(packageType) {
  try {
    // Generate with new Mustache approach
    const newContent = generateREADME(packageType);

    // Try to read existing README for comparison
    const packagePath = packageType === 'workspace'
      ? rootDir
      : path.join(rootDir, 'packages', packageType);

    const existingPath = path.join(packagePath, 'README.md');
    const existingContent = fs.existsSync(existingPath)
      ? fs.readFileSync(existingPath, 'utf8')
      : '';

    return {
      packageType,
      newLength: newContent.length,
      existingLength: existingContent.length,
      sizeDiff: newContent.length - existingContent.length,
      hasChanges: newContent !== existingContent,
      newContent: `${newContent.substring(0, 500)}...`,
      existingContent: `${existingContent.substring(0, 500)}...`
    };
  } catch (error) {
    return {
      packageType,
      error: error.message
    };
  }
}

export default {
  generateREADME,
  writeREADME,
  generateAllREADMEs,
  validateREADMETemplates,
  compareREADMEApproaches
};
